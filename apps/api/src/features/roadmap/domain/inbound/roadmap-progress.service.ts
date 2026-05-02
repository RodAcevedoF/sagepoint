import { Observable } from 'rxjs';

export const ROADMAP_PROGRESS_SERVICE = Symbol('ROADMAP_PROGRESS_SERVICE');

export interface SseProgressEvent {
  data: string;
}

export interface IRoadmapProgressService {
  streamProgress(roadmapId: string): Observable<SseProgressEvent>;
}
