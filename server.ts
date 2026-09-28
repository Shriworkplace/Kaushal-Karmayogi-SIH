import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { store } from './src/server/store.ts';
import { generateQuizQuestions, answerCourseQuery } from './src/server/ai.ts';
import { CompetencyCode, DifficultyLevel, RoleType } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with 15MB limit for PDF/PPT uploads per PRD §4.4
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// --- API Routes ---

// Auth / User Switcher (Mock Parichay SSO Stand-in)
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = store.getCurrentUser();
  res.json({ user });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  const users = store.getAllUsers();
  res.json({ users });
});

app.post('/api/auth/switch', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const user = store.setCurrentUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// F-01 & F-02: Onboarding
app.post('/api/onboarding', (req: Request, res: Response) => {
  try {
    const { name, email, department, designation, years_experience, self_ratings } = req.body;
    if (!name || !department || !designation || !self_ratings) {
      return res.status(400).json({ error: 'Missing required onboarding fields' });
    }

    // Verify all 7 competencies are provided
    const requiredCodes: CompetencyCode[] = ['DC', 'SD', 'DP', 'SA', 'DV', 'SO', 'LE'];
    for (const code of requiredCodes) {
      if (typeof self_ratings[code] !== 'number' || self_ratings[code] < 1 || self_ratings[code] > 5) {
        return res.status(400).json({ error: `Invalid rating for competency ${code}. Must be 1 to 5.` });
      }
    }

    const newUser = store.createUser({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@mospi.gov.in`,
      department,
      designation: designation as RoleType,
      years_experience: Number(years_experience) || 1,
      self_ratings,
    });

    const dashboard = store.getDashboardData(newUser.id);
    res.json({ user: newUser, dashboard });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F-10 to F-14: Learner Dashboard
app.get('/api/me/dashboard', (req: Request, res: Response) => {
  try {
    const user = store.getCurrentUser();
    const dashboard = store.getDashboardData(user.id);
    res.json(dashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F-04: Update Self Ratings
app.post('/api/me/ratings', (req: Request, res: Response) => {
  try {
    const user = store.getCurrentUser();
    const { ratings } = req.body;
    if (!ratings) {
      return res.status(400).json({ error: 'ratings object required' });
    }

    store.updateSelfRatings(user.id, ratings);
    const dashboard = store.getDashboardData(user.id);
    res.json(dashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F-20 & F-21: Courses
app.get('/api/courses', (req: Request, res: Response) => {
  const { competency, difficulty, language, search } = req.query as Record<string, string>;
  const courses = store.getCourses({
    competency,
    difficulty,
    language,
    search,
  });
  res.json({ courses });
});

app.post('/api/courses/:id/complete', (req: Request, res: Response) => {
  try {
    const user = store.getCurrentUser();
    const courseId = req.params.id;
    const completed = store.toggleCourseCompletion(user.id, courseId);
    const dashboard = store.getDashboardData(user.id);
    res.json({ completed, dashboard });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F-40 to F-44: Quizzes
app.get('/api/quizzes', (req: Request, res: Response) => {
  const user = store.getCurrentUser();
  const { competency } = req.query as Record<string, string>;
  const quizzes = store.getQuizzes(user.role, competency);
  res.json({ quizzes });
});

app.get('/api/quizzes/:id', (req: Request, res: Response) => {
  const user = store.getCurrentUser();
  const isLearner = user.role === 'learner';
  const quiz = store.getQuizById(req.params.id, isLearner);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  res.json({ quiz });
});

app.post('/api/quizzes/:id/attempt', (req: Request, res: Response) => {
  try {
    const user = store.getCurrentUser();
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' });
    }

    const result = store.submitQuizAttempt(user.id, req.params.id, answers);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F-30 to F-35: Admin Materials & AI Quiz Generator
app.get('/api/admin/materials', (req: Request, res: Response) => {
  const materials = store.getMaterials();
  res.json({ materials });
});

app.post('/api/admin/materials', async (req: Request, res: Response) => {
  try {
    const { title, filename, fileBase64, textContent, competency_code } = req.body;

    let extractedText = textContent || '';

    // If PDF base64 is supplied, extract text using pdf-parse
    if (fileBase64 && (!extractedText || extractedText.length < 50)) {
      try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const buffer = Buffer.from(fileBase64, 'base64');
        const pdfData = await pdfParse(buffer);
        if (pdfData && pdfData.text) {
          extractedText = pdfData.text.trim();
        }
      } catch (pdfErr) {
        console.warn('PDF parsing error, using fallback or provided text:', pdfErr);
      }
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({
        error: 'Could not extract sufficient text from the material. Please provide valid text content or a legible text-based PDF.',
      });
    }

    const user = store.getCurrentUser();
    const material = store.createMaterial({
      title: title || filename || 'Uploaded Training Document',
      filename: filename || 'document.txt',
      extracted_text: extractedText,
      competency_code: competency_code || 'SA',
      created_by: user.name,
    });

    res.json({ material });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/quizzes/generate', async (req: Request, res: Response) => {
  try {
    const {
      material_id,
      text_content,
      competency,
      difficulty,
      count,
      title,
    } = req.body;

    let textToUse = text_content || '';
    let selectedMaterialId = material_id;

    if (material_id) {
      const mat = store.getMaterials().find(m => m.id === material_id);
      if (mat) {
        textToUse = mat.extracted_text;
      }
    }

    if (!textToUse || textToUse.trim().length < 50) {
      return res.status(400).json({
        error: 'Extracted source text is required and must contain at least 50 characters.',
      });
    }

    const questionCount = Math.min(10, Math.max(5, Number(count) || 5));
    const targetComp: CompetencyCode = competency || 'SA';
    const targetDiff: DifficultyLevel = difficulty || 'intermediate';

    const aiResult = await generateQuizQuestions({
      extractedText: textToUse,
      competency: targetComp,
      difficulty: targetDiff,
      count: questionCount,
    });

    const user = store.getCurrentUser();
    const draftQuiz = store.createQuiz({
      material_id: selectedMaterialId,
      title: title || `Auto-Generated Assessment: ${targetComp} (${targetDiff})`,
      competency_code: targetComp,
      difficulty: targetDiff,
      status: 'draft',
      created_by: user.name,
      questions: aiResult.questions,
    });

    res.json({
      quiz: draftQuiz,
      truncated: aiResult.truncated,
      char_count: aiResult.charCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/quizzes/:id', (req: Request, res: Response) => {
  try {
    const updated = store.updateQuiz(req.params.id, req.body);
    res.json({ quiz: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/quizzes/:id/publish', (req: Request, res: Response) => {
  try {
    const published = store.publishQuiz(req.params.id);
    res.json({ quiz: published });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F-50 to F-53: Admin Analytics
app.get('/api/admin/analytics/heatmap', (req: Request, res: Response) => {
  try {
    const heatmap = store.getHeatmapAnalytics();
    res.json(heatmap);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/analytics/courses', (req: Request, res: Response) => {
  try {
    const effectiveness = store.getCourseEffectiveness();
    res.json({ courses: effectiveness });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/analytics/suggestions', (req: Request, res: Response) => {
  try {
    const suggestions = store.getSuggestedNewCourses();
    res.json({ suggestions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/summary', (req: Request, res: Response) => {
  try {
    const stats = store.getSummaryStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reset', (req: Request, res: Response) => {
  store.reset();
  res.json({ success: true, message: 'All database tables restored to initial seed state.' });
});

// F-60: RAG Course Advisor Chatbot
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const courses = store.getCourses();
    const answer = await answerCourseQuery(query, courses);
    res.json({ answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Integration (Dev) or Static File Serving (Production)
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kaushal Karmayogi Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
