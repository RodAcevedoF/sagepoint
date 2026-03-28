-- Migration: 20260328185454_add-news-articles
-- Author: raacevedo
-- Created: 2026-03-28T18:54:54.922Z

CREATE TABLE news_articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  url           TEXT NOT NULL UNIQUE,
  "imageUrl"    TEXT,
  source        TEXT NOT NULL,
  "publishedAt" TIMESTAMPTZ NOT NULL,
  "categoryId"  UUID NOT NULL REFERENCES categories(id),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_articles_category ON news_articles("categoryId");
CREATE INDEX idx_news_articles_created  ON news_articles("createdAt");
