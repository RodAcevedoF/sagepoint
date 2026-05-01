export function buildTopicRoadmapTitle(topic: string, title?: string): string {
  if (title) return title;

  const trimmedTopic = topic.trim();
  const normalizedTopic = trimmedTopic
    .replace(/^(learn\b[\s:,-]*)+/i, '')
    .trim();

  return `Learn ${normalizedTopic || trimmedTopic}`;
}
