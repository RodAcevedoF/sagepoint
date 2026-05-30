CREATE TABLE "review_cards" (
    "id"             UUID         NOT NULL,
    "userId"         UUID         NOT NULL,
    "source"         TEXT         NOT NULL,
    "sourceId"       TEXT         NOT NULL,
    "questionId"     TEXT         NOT NULL,
    "interval"       INTEGER      NOT NULL DEFAULT 0,
    "easeFactor"     DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions"    INTEGER      NOT NULL DEFAULT 0,
    "lapses"         INTEGER      NOT NULL DEFAULT 0,
    "dueAt"          TIMESTAMP(3) NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "review_cards_userId_source_questionId_key"
    ON "review_cards" ("userId", "source", "questionId");

CREATE INDEX "review_cards_userId_dueAt_idx"
    ON "review_cards" ("userId", "dueAt");

CREATE INDEX "review_cards_userId_source_sourceId_idx"
    ON "review_cards" ("userId", "source", "sourceId");
