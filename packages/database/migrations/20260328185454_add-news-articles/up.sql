-- Migration: 20260328185454_add-news-articles
-- Author: raacevedo
-- Created: 2026-03-28T18:54:54.922Z

CREATE TABLE news_articles (
  id            TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  url           TEXT NOT NULL UNIQUE,
  "imageUrl"    TEXT,
  source        TEXT NOT NULL,
  "publishedAt" TIMESTAMPTZ NOT NULL,
  "categoryId"  TEXT NOT NULL REFERENCES categories(id),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX idx_news_articles_category ON news_articles("categoryId");
CREATE INDEX idx_news_articles_created  ON news_articles("createdAt");
