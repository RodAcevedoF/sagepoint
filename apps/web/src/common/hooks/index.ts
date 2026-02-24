import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/infrastructure/store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useRoadmapEvents } from './useRoadmapEvents';
export { useDocumentEvents, type DocumentEventStage } from './useDocumentEvents';
