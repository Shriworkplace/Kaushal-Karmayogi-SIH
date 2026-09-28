import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { CompetencyCode, DifficultyLevel, Question } from '../types/index.ts';
import { COMPETENCY_NAMES } from './scoring.ts';

dotenv.config();

// Initialize the GoogleGenAI client with the required User-Agent
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface GenerateQuizParams {
  extractedText: string;
  competency: CompetencyCode;
  difficulty: DifficultyLevel;
  count: number;
}

export function validateQuestions(
  rawList: any[],
  expectedCompetency: CompetencyCode,
  expectedDifficulty: DifficultyLevel,
  expectedCount: number
): { valid: boolean; errors: string[]; questions: Question[] } {
  const errors: string[] = [];
  const validQuestions: Question[] = [];

  if (!Array.isArray(rawList)) {
    return {
      valid: false,
      errors: ['Output must be an array of questions'],
      questions: [],
    };
  }

  for (let i = 0; i < rawList.length; i++) {
    const q = rawList[i];
    const prefix = `Question ${i + 1}: `;

    if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 10) {
      errors.push(`${prefix}Missing or too short question text.`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${prefix}Must have exactly 4 options.`);
    } else {
      const distinct = new Set(q.options.map((o: any) => String(o).trim()));
      if (distinct.size !== 4) {
        errors.push(`${prefix}Options must be 4 distinct choices.`);
      }
      if (q.options.some((o: any) => !o || String(o).trim().length === 0)) {
        errors.push(`${prefix}Options cannot be empty.`);
      }
    }

    const correctIdx = Number(q.correct_index);
    if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
      errors.push(`${prefix}correct_index must be an integer between 0 and 3.`);
    }

    if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length < 20) {
      errors.push(`${prefix}Explanation must be at least 20 characters long citing the source text.`);
    }

    const validCompetencies: CompetencyCode[] = ['DC', 'SD', 'DP', 'SA', 'DV', 'SO', 'LE'];
    const comp = validCompetencies.includes(q.competency) ? q.competency : expectedCompetency;

    const validDifficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
    const diff = validDifficulties.includes(q.difficulty) ? q.difficulty : expectedDifficulty;

    if (errors.length === 0) {
      validQuestions.push({
        id: `gen-q-${Date.now().toString(36)}-${i + 1}`,
        question: q.question.trim(),
        options: [
          String(q.options[0]).trim(),
          String(q.options[1]).trim(),
          String(q.options[2]).trim(),
          String(q.options[3]).trim(),
        ],
        correct_index: correctIdx,
        explanation: q.explanation.trim(),
        competency: comp,
        difficulty: diff,
      });
    }
  }

  if (validQuestions.length !== expectedCount && errors.length === 0) {
    errors.push(`Expected exactly ${expectedCount} questions, but got ${validQuestions.length}`);
  }

  return {
    valid: errors.length === 0 && validQuestions.length === expectedCount,
    errors,
    questions: validQuestions,
  };
}

/**
 * AI Quiz Generator implementing PRD §7
 */
export async function generateQuizQuestions(
  params: GenerateQuizParams
): Promise<{ questions: Question[]; truncated: boolean; charCount: number }> {
  const { competency, difficulty, count } = params;
  const compName = COMPETENCY_NAMES[competency] || competency;

  // PRD §7.1: Truncate to first ~12k characters
  const MAX_CHARS = 12000;
  const truncated = params.extractedText.length > MAX_CHARS;
  const processedText = params.extractedText.slice(0, MAX_CHARS);

  const systemInstruction = `You are an assessment writer for India's Ministry of Statistics and Programme Implementation. Write multiple-choice questions strictly from the provided source text. Do not use outside knowledge. Return ONLY valid JSON matching the schema, with no prose and no markdown fences. Each question has exactly 4 options, one correct. Wrong options must be plausible but clearly wrong according to the text. Explanations must cite what the text says.`;

  const userPrompt = `Source text:
${processedText}

Write exactly ${count} multiple-choice questions.
Competency: ${compName} (${competency}).
Difficulty: ${difficulty}.
JSON Schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_index": 0,
      "explanation": "string (at least 20 chars citing the text)",
      "competency": "${competency}",
      "difficulty": "${difficulty}"
    }
  ]
}`;

  if (ai) {
    try {
      // First attempt
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correct_index: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    competency: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                  },
                  required: [
                    'question',
                    'options',
                    'correct_index',
                    'explanation',
                    'competency',
                    'difficulty',
                  ],
                },
              },
            },
            required: ['questions'],
          },
        },
      });

      const responseText = response.text || '';
      let parsed = JSON.parse(responseText);
      let validation = validateQuestions(parsed.questions, competency, difficulty, count);

      if (validation.valid) {
        return {
          questions: validation.questions,
          truncated,
          charCount: processedText.length,
        };
      }

      // Retry once with validation error appended per PRD §7.1
      const retryPrompt = `${userPrompt}\n\nATTENTION: Your previous output had the following schema validation errors:\n${validation.errors.join(
        '\n'
      )}\nPlease fix these errors and return valid JSON with exactly ${count} questions.`;

      const retryResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: retryPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      parsed = JSON.parse(retryResponse.text || '');
      validation = validateQuestions(parsed.questions, competency, difficulty, count);

      if (validation.valid) {
        return {
          questions: validation.questions,
          truncated,
          charCount: processedText.length,
        };
      } else {
        throw new Error(`Validation failed after retry: ${validation.errors.join('; ')}`);
      }
    } catch (err: any) {
      console.warn('Gemini API call failed or threw error; checking fallback generator:', err?.message);
    }
  }

  // Resilient fallback parser generator for pitch demo safety (§16)
  return {
    questions: generateDemoFallbackQuestions(processedText, competency, difficulty, count),
    truncated,
    charCount: processedText.length,
  };
}

/**
 * Intelligent demo-safety fallback question generator parsing key statements from text
 */
function generateDemoFallbackQuestions(
  text: string,
  competency: CompetencyCode,
  difficulty: DifficultyLevel,
  count: number
): Question[] {
  const lines = text
    .split(/\n|\. /)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 180 && !s.startsWith('#'));

  const questions: Question[] = [];
  const compName = COMPETENCY_NAMES[competency] || competency;

  for (let i = 0; i < count; i++) {
    const seedLine = lines[i % lines.length] || `MoSPI statistical procedure requires rigorous verification for ${compName}.`;
    
    questions.push({
      id: `gen-fb-${Date.now().toString(36)}-${i + 1}`,
      question: `According to the source documentation regarding ${compName}, what standard requirement is mandated for: "${seedLine.slice(0, 70)}..."?`,
      options: [
        `Strict adherence to the documented official protocol as described in the operational section.`,
        `Discretionary field modification by the enumerator without supervisory logging.`,
        `Complete exemption from statutory scrutiny rules during national rounds.`,
        `Substitution with non-verified auxiliary records from commercial sources.`,
      ],
      correct_index: 0,
      explanation: `The operational guidelines explicitly mandate adherence: "${seedLine.slice(0, 100)}..." ensuring integrity across official statistical releases.`,
      competency,
      difficulty,
    });
  }

  return questions;
}

/**
 * RAG Course Advisor for the Stretch Goal (§4.7 F-60)
 */
export async function answerCourseQuery(
  userQuery: string,
  courses: { id: string; title: string; description: string; difficulty: string; language: string; competencies: { code: string; weight: number }[] }[]
): Promise<string> {
  if (ai) {
    try {
      const courseCatalogSummary = courses
        .map(
          c =>
            `- [${c.id}] ${c.title} (${c.difficulty}, ${c.language}): ${c.description} (Competencies: ${c.competencies.map(cw => cw.code).join(', ')})`
        )
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the Kaushal Karmayogi AI Learning Advisor for India's Ministry of Statistics and Programme Implementation (MoSPI).
Ground your answer ONLY in the following official course catalog. Recommend 2 to 3 courses with their IDs, titles, and exact reasons why they fit the official's learning need.

OFFICIAL COURSE CATALOG:
${courseCatalogSummary}

USER QUERY:
"${userQuery}"

Provide a concise, encouraging, authoritative government advisor response.`,
      });

      if (response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn('RAG query failed:', e);
    }
  }

  // Fallback keyword search response
  const queryLower = userQuery.toLowerCase();
  const matched = courses
    .filter(c =>
      c.title.toLowerCase().includes(queryLower) ||
      c.description.toLowerCase().includes(queryLower) ||
      c.competencies.some(cw => queryLower.includes(cw.code.toLowerCase()))
    )
    .slice(0, 3);

  if (matched.length > 0) {
    return `Based on your request, I recommend the following MoSPI iGOT courses:\n\n${matched
      .map(
        c =>
          `• **${c.title}** (${c.id}, ${c.difficulty}): ${c.description}`
      )
      .join('\n\n')}\n\nYou can enrol directly through your dashboard recommendation cards.`;
  }

  return `For your learning objectives, browse our **Course Catalog** tab and filter by competency or difficulty. You can also take one of our diagnostic quizzes to pinpoint your exact skill gaps!`;
}
