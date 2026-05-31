"use client";

import { use } from "react";
import { RootWrapper } from "@/shared/components";
import { QuizView } from "@/features/document";

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = use(params);

  return (
    <RootWrapper>
      <QuizView documentId={id} quizId={quizId} />
    </RootWrapper>
  );
}
