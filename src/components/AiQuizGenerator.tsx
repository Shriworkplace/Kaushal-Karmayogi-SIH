import React, { useState } from 'react';
import {
  CompetencyCode,
  DifficultyLevel,
  Material,
  Question,
  Quiz,
} from '../types/index.ts';
import { SEED_COMPETENCIES } from '../server/seed.ts';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  RefreshCw,
  Plus,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { COMPETENCY_NAMES } from '../server/scoring.ts';

interface AiQuizGeneratorProps {
  materials: Material[];
  onUploadMaterial: (payload: {
    title: string;
    filename: string;
    fileBase64?: string;
    textContent?: string;
    competency_code?: CompetencyCode;
  }) => Promise<Material>;
  onGenerateQuiz: (payload: {
    material_id?: string;
    text_content?: string;
    competency: CompetencyCode;
    difficulty: DifficultyLevel;
    count: number;
    title?: string;
  }) => Promise<{ quiz: Quiz; truncated: boolean; char_count: number }>;
  onUpdateQuiz: (quizId: string, updates: Partial<Quiz>) => Promise<Quiz>;
  onPublishQuiz: (quizId: string) => Promise<Quiz>;
  onQuizPublishedRedirect?: () => void;
}

export const AiQuizGenerator: React.FC<AiQuizGeneratorProps> = ({
  materials,
  onUploadMaterial,
  onGenerateQuiz,
  onUpdateQuiz,
  onPublishQuiz,
  onQuizPublishedRedirect,
}) => {
  // Source selection: 'sample' | 'custom_file' | 'custom_text'
  const [sourceMode, setSourceMode] = useState<'sample' | 'custom_file' | 'custom_text'>('sample');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileBase64, setFileBase64] = useState<string | undefined>(undefined);

  // Configuration
  const [competency, setCompetency] = useState<CompetencyCode>('SA');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [count, setCount] = useState<number>(5);
  const [quizTitle, setQuizTitle] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [draftQuiz, setDraftQuiz] = useState<Quiz | null>(null);
  const [truncatedNotice, setTruncatedNotice] = useState(false);

  // Editing single question modal / state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB limit as per PRD specification.');
      return;
    }

    setFileName(file.name);
    setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    if (file.type === 'text/plain') {
      reader.onload = () => {
        setCustomText(reader.result as string);
        setFileBase64(undefined);
      };
      reader.readAsText(file);
    } else {
      // PDF or binary
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFileBase64(base64);
        setCustomText(`[PDF Document: ${file.name} (${Math.round(file.size / 1024)} KB)]`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartGeneration = async () => {
    setGenerating(true);
    setGenerationError(null);
    setPublishSuccess(false);

    try {
      let materialIdToUse = selectedMaterialId;

      if (sourceMode !== 'sample') {
        // Upload custom material first
        const uploaded = await onUploadMaterial({
          title: customTitle || fileName || 'Uploaded Training Document',
          filename: fileName || 'document.txt',
          fileBase64,
          textContent: customText,
          competency_code: competency,
        });
        materialIdToUse = uploaded.id;
      }

      const generated = await onGenerateQuiz({
        material_id: materialIdToUse,
        competency,
        difficulty,
        count,
        title:
          quizTitle ||
          `Assessment: ${COMPETENCY_NAMES[competency]} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
      });

      setDraftQuiz(generated.quiz);
      setTruncatedNotice(generated.truncated);
    } catch (err: any) {
      setGenerationError(err.message || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateQuestion = (qIndex: number, updatedQ: Question) => {
    if (!draftQuiz) return;
    const newQuestions = [...draftQuiz.questions];
    newQuestions[qIndex] = updatedQ;
    const updated = { ...draftQuiz, questions: newQuestions };
    setDraftQuiz(updated);
    onUpdateQuiz(draftQuiz.id, { questions: newQuestions }).catch(() => {});
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (!draftQuiz) return;
    if (draftQuiz.questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const newQuestions = draftQuiz.questions.filter((_, idx) => idx !== qIndex);
    const updated = { ...draftQuiz, questions: newQuestions };
    setDraftQuiz(updated);
    onUpdateQuiz(draftQuiz.id, { questions: newQuestions }).catch(() => {});
  };

  const handlePublish = async () => {
    if (!draftQuiz) return;
    setPublishing(true);
    try {
      await onPublishQuiz(draftQuiz.id);
      setPublishSuccess(true);
      if (onQuizPublishedRedirect) {
        setTimeout(onQuizPublishedRedirect, 1500);
      }
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                TRAINING CELL ADMIN
              </span>
              <span className="text-slate-300">|</span>
              <h2 className="text-base font-bold text-slate-900">
                AI Auto-Quiz Generator (PRD §4.4)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Transform MoSPI field manuals, methodology compendiums, or statutory guidelines into rigorous MCQs.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Source & Configuration Panel (Only if no draft or if regenerating) */}
      {!draftQuiz && (
        <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-6">
          {/* Source Document Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              1. Select Training Material Source
            </label>

            {/* Segmented Mode Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSourceMode('sample')}
                className={`py-2 px-3 rounded-md transition-colors cursor-pointer text-center ${
                  sourceMode === 'sample' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Preloaded MoSPI Manuals
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('custom_file')}
                className={`py-2 px-3 rounded-md transition-colors cursor-pointer text-center ${
                  sourceMode === 'custom_file' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload PDF / PPTX
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('custom_text')}
                className={`py-2 px-3 rounded-md transition-colors cursor-pointer text-center ${
                  sourceMode === 'custom_text' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Source Text
              </button>
            </div>

            {/* Sample Selector */}
            {sourceMode === 'sample' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materials.map(mat => (
                    <div
                      key={mat.id}
                      onClick={() => {
                        setSelectedMaterialId(mat.id);
                        if (mat.competency_code) setCompetency(mat.competency_code);
                      }}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedMaterialId === mat.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">
                          {mat.competency_code || 'General'}
                        </span>
                        <span>{mat.char_count.toLocaleString()} chars</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {mat.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {mat.extracted_text.slice(0, 120)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Box */}
            {sourceMode === 'custom_file' && (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    Click to select a PDF, PPTX or TXT file
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.pptx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: PDF, PPTX, TXT up to 10 MB. Text extracted server-side.
                </p>
                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-md text-xs font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Custom Textarea */}
            {sourceMode === 'custom_text' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Material Title / Subject"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <textarea
                  rows={5}
                  placeholder="Paste excerpt from official training document or survey guidelines (minimum 50 characters)..."
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
                <div className="text-[11px] text-slate-500 text-right">
                  {customText.length} characters
                </div>
              </div>
            )}
          </div>

          {/* Configuration Parameters */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Assessment Parameters
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Target Competency */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Competency
                </label>
                <select
                  value={competency}
                  onChange={e => setCompetency(e.target.value as CompetencyCode)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {SEED_COMPETENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Questions to Generate: <strong>{count}</strong>
                </label>
                <select
                  value={count}
                  onChange={e => setCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={5}>5 Questions (Recommended)</option>
                  <option value={6}>6 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Quiz Title (Optional)
              </label>
              <input
                type="text"
                placeholder={`e.g. Assessment on ${COMPETENCY_NAMES[competency]} Standards`}
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Error notice if any */}
          {generationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Generation failed:</strong> {generationError}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleStartGeneration}
              disabled={generating}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg shadow-xs transition-all ${
                generating
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-[#0b2545] hover:bg-[#13315c] text-white cursor-pointer'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{generating ? 'Calling Gemini AI Engine...' : 'Draft MCQs via AI'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review Screen (PRD §4.4 F-33) */}
      {draftQuiz && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Status: DRAFT
                </span>
                <span>·</span>
                <span>{draftQuiz.competency_code}</span>
                <span>·</span>
                <span className="capitalize">{draftQuiz.difficulty}</span>
                <span>·</span>
                <span>{draftQuiz.questions.length} questions</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{draftQuiz.title}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setDraftQuiz(null)}
                className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 sm:border-transparent text-center"
              >
                Discard & New Draft
              </button>

              <button
                onClick={handlePublish}
                disabled={publishing || publishSuccess}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg transition-all shadow-xs ${
                  publishSuccess
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{publishSuccess ? 'Published to Learners!' : publishing ? 'Publishing...' : 'Publish Quiz'}</span>
              </button>
            </div>
          </div>

          {truncatedNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Note: The source document exceeded 12,000 characters and was truncated per PRD specification.
            </div>
          )}

          {publishSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Quiz Published Successfully!</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  MoSPI officials can now attempt this quiz under the "Assessments & Quizzes" tab.
                </p>
              </div>
            </div>
          )}

          {/* Questions Editor List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Review, edit, or remove generated questions:</span>
              <span className="text-[11px] text-slate-400">
                Click any field to edit in real time
              </span>
            </div>

            {draftQuiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-xs font-bold text-slate-500 mt-1">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={q.question}
                      onChange={e =>
                        handleUpdateQuestion(idx, { ...q, question: e.target.value })
                      }
                      className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Choices */}
                <div className="space-y-1.5 pl-5">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correct_index === optIdx;

                    return (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuestion(idx, { ...q, correct_index: optIdx })
                          }
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                          title={isCorrect ? 'Correct choice' : 'Click to set as correct answer'}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </button>

                        <input
                          type="text"
                          value={opt}
                          onChange={e => {
                            const newOpts = [...q.options] as [string, string, string, string];
                            newOpts[optIdx] = e.target.value;
                            handleUpdateQuestion(idx, { ...q, options: newOpts });
                          }}
                          className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                            isCorrect
                              ? 'border-emerald-300 bg-emerald-50/30 font-medium'
                              : 'border-slate-200'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Explanation citation */}
                <div className="pl-5 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Source Text Citation & Explanation (≥ 20 characters):
                  </label>
                  <textarea
                    rows={2}
                    value={q.explanation}
                    onChange={e =>
                      handleUpdateQuestion(idx, { ...q, explanation: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
