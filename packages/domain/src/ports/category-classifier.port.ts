export const CATEGORY_CLASSIFIER_SERVICE = Symbol(
  "CATEGORY_CLASSIFIER_SERVICE",
);

export interface CategoryCandidate {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ClassifyCategoryInput {
  topic: string;
  conceptNames: string[];
  candidates: CategoryCandidate[];
}

export interface ICategoryClassifierService {
  classify(input: ClassifyCategoryInput): Promise<string | null>;
}
