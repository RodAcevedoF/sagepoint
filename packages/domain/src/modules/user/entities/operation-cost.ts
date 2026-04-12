export const OperationType = {
  DOCUMENT_UPLOAD: "DOCUMENT_UPLOAD",
  ROADMAP_FROM_DOCUMENT: "ROADMAP_FROM_DOCUMENT",
  TOPIC_ROADMAP: "TOPIC_ROADMAP",
} as const;

export type OperationType = (typeof OperationType)[keyof typeof OperationType];

export const OPERATION_COSTS: Record<OperationType, number> = {
  DOCUMENT_UPLOAD: 10,
  ROADMAP_FROM_DOCUMENT: 15,
  TOPIC_ROADMAP: 20,
};
