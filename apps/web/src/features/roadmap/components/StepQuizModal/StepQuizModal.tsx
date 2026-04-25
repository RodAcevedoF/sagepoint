import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material";
import { useStepQuizCommand } from "@/application/roadmap";
import type {
  StepQuizQuestionDto,
  QuestionResultDto,
} from "@/infrastructure/api/roadmapApi";
import { Loader } from "@/shared/components/ui/Loader";
import { ErrorState } from "@/shared/components/ui/States";
import { makeStyles } from "./StepQuizModal.styles";
import { QuizQuestions } from "./QuizQuestions";
import { QuizResults } from "./QuizResults";

type Phase = "loading" | "quiz" | "results";

interface PreGeneratedQuiz {
  attemptId: string;
  questions: StepQuizQuestionDto[];
}

interface StepQuizModalProps {
  roadmapId: string;
  conceptId: string;
  conceptName: string;
  preGeneratedQuiz?: PreGeneratedQuiz | null;
  onClose: () => void;
}

interface QuizState {
  phase: Phase;
  attemptId: string | null;
  questions: StepQuizQuestionDto[];
  answers: Record<number, string>;
  results: QuestionResultDto[] | null;
  passed: boolean;
  score: number;
  error: string | null;
}

const INITIAL_STATE: QuizState = {
  phase: "loading",
  attemptId: null,
  questions: [],
  answers: {},
  results: null,
  passed: false,
  score: 0,
  error: null,
};

export function StepQuizModal({
  roadmapId,
  conceptId,
  conceptName,
  preGeneratedQuiz,
  onClose,
}: StepQuizModalProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { generate, submit, isGenerating, isSubmitting } = useStepQuizCommand();

  const [state, setState] = useState<QuizState>(() =>
    preGeneratedQuiz
      ? {
          ...INITIAL_STATE,
          phase: "quiz",
          attemptId: preGeneratedQuiz.attemptId,
          questions: preGeneratedQuiz.questions,
        }
      : INITIAL_STATE,
  );

  const loadQuiz = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      phase: "loading",
      error: null,
      answers: {},
      results: null,
    }));
    const result = await generate(roadmapId, conceptId);
    if (result.ok) {
      setState((prev) => ({
        ...prev,
        phase: "quiz",
        attemptId: result.data.attemptId,
        questions: result.data.questions,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        phase: "loading",
        error: "Failed to generate quiz. Please try again.",
      }));
    }
  }, [generate, roadmapId, conceptId]);

  // Auto-load quiz once after mount. Ref avoids double-fire in StrictMode.
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current || preGeneratedQuiz) return;
    initRef.current = true;
    let cancelled = false;
    (async () => {
      const result = await generate(roadmapId, conceptId);
      if (cancelled) return;
      if (result.ok) {
        setState((prev) => ({
          ...prev,
          phase: "quiz",
          attemptId: result.data.attemptId,
          questions: result.data.questions,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          phase: "loading",
          error: "Failed to generate quiz. Please try again.",
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [generate, roadmapId, conceptId, preGeneratedQuiz]);

  const handleSelectAnswer = (questionIndex: number, label: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionIndex]: label },
    }));
  };

  const handleSubmit = async () => {
    if (!state.attemptId) return;
    const result = await submit(roadmapId, state.attemptId, state.answers);
    if (result.ok) {
      setState((prev) => ({
        ...prev,
        phase: "results",
        passed: result.data.passed,
        score: result.data.score,
        results: result.data.results,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        error: "Failed to submit quiz. Please try again.",
      }));
    }
  };

  const allAnswered =
    state.questions.length > 0 &&
    state.questions.every((_, i) => state.answers[i] !== undefined);

  if (state.error && state.phase === "loading") {
    return (
      <ErrorState
        title="Quiz unavailable"
        description={state.error}
        onRetry={loadQuiz}
      />
    );
  }

  if (state.phase === "loading") {
    return (
      <Loader
        variant="circular"
        message={`Preparing quiz for ${conceptName}...`}
        sx={{ py: 6 }}
      />
    );
  }

  if (state.phase === "results" && state.results) {
    return (
      <QuizResults
        passed={state.passed}
        score={state.score}
        results={state.results}
        questions={state.questions}
        isGenerating={isGenerating}
        onRetry={loadQuiz}
        onClose={onClose}
        styles={styles}
      />
    );
  }

  return (
    <QuizQuestions
      questions={state.questions}
      answers={state.answers}
      error={state.error}
      isSubmitting={isSubmitting}
      allAnswered={allAnswered}
      onSelectAnswer={handleSelectAnswer}
      onSubmit={handleSubmit}
      onClose={onClose}
      styles={styles}
    />
  );
}
