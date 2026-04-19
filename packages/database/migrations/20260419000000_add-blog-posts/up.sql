CREATE TYPE "BlogPostSource" AS ENUM ('STATIC', 'GENERATED');

CREATE TABLE "blog_posts" (
  "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
  "slug"            TEXT          NOT NULL,
  "title"           TEXT          NOT NULL,
  "excerpt"         TEXT          NOT NULL,
  "contentMarkdown" TEXT          NOT NULL,
  "heroImageUrl"    TEXT,
  "categoryId"      UUID          NOT NULL,
  "author"          TEXT          NOT NULL DEFAULT 'Sagepoint Team',
  "source"          "BlogPostSource" NOT NULL DEFAULT 'GENERATED',
  "sources"         JSONB         NOT NULL DEFAULT '[]',
  "publishedAt"     TIMESTAMPTZ   NOT NULL,
  "createdAt"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug"),
  CONSTRAINT "blog_posts_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT
);

CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts" ("publishedAt" DESC);
CREATE INDEX "blog_posts_categoryId_idx" ON "blog_posts" ("categoryId");
