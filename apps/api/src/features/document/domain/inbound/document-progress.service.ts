import { Observable } from 'rxjs';

export const DOCUMENT_PROGRESS_SERVICE = Symbol('DOCUMENT_PROGRESS_SERVICE');

export interface SseProgressEvent {
  data: string;
}

export interface IDocumentProgressService {
  streamProgress(documentId: string): Observable<SseProgressEvent>;
}
