"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSseEvents, type SseState } from "./useSseEvents";
import type { AppDispatch } from "@/infrastructure/store/store";
import { baseApi, type ApiTagType } from "@/infrastructure/api/baseApi";
import type { TagDescription } from "@reduxjs/toolkit/query";
import { useSnackbar } from "@/shared/components/feedback/Snackbar/snackbar-context";

export interface EventStreamConfig<TStage extends string> {
  path: string | null;
  completedStage: TStage;
  toasts?: { start?: string; finish?: string };
  startWhen?: (s: SseState<TStage>) => boolean;
  isPhaseOneDone?: (s: SseState<TStage>) => boolean;
  invalidateOnPhaseOneDone?: TagDescription<ApiTagType>[];
  invalidateOnComplete?: TagDescription<ApiTagType>[];
}

// Module-level dedupe keyed by path (unique per domain+id): each stream toasts at
// most once per session, even when the hook is mounted in several cards/views at once.
const startedPaths = new Set<string>();
const finishedPaths = new Set<string>();

/**
 * Config-driven SSE watcher. Wraps the useSseEvents transport and owns the
 * cross-cutting concerns: lifecycle toasts (per-path dedupe) and cache
 * invalidation on phase-one-done / completion.
 */
export function useEventStream<TStage extends string>(
  config: EventStreamConfig<TStage>,
): SseState<TStage> {
  const { path, completedStage } = config;
  const state = useSseEvents<TStage>(path, completedStage);

  const dispatch = useDispatch<AppDispatch>();
  const { showSnackbar } = useSnackbar();

  // Hold the latest config without making the effects depend on its identity;
  // mirrors how useSseEvents keeps completedStage in a ref.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const phaseOneInvalidatedRef = useRef(false);
  const completeInvalidatedRef = useRef(false);

  useEffect(() => {
    phaseOneInvalidatedRef.current = false;
    completeInvalidatedRef.current = false;
  }, [path]);

  useEffect(() => {
    if (!path) return;
    const { toasts, startWhen, isPhaseOneDone } = configRef.current;

    if (toasts?.start && startWhen?.(state) && !startedPaths.has(path)) {
      startedPaths.add(path);
      showSnackbar(toasts.start, { severity: "info" });
    }
    // Prefer phase-one-done as the "ready" signal when the consumer defines it:
    // the listening component typically unmounts on phase-one invalidation, so a
    // phase-two `status === 'completed'` event would arrive after the EventSource
    // is gone. Falls back to status==='completed' for streams without phases.
    const isFinished = isPhaseOneDone
      ? isPhaseOneDone(state)
      : state.status === "completed";
    if (toasts?.finish && isFinished && !finishedPaths.has(path)) {
      finishedPaths.add(path);
      showSnackbar(toasts.finish, { severity: "success" });
    }
  }, [state, path, showSnackbar]);

  useEffect(() => {
    if (!path) return;
    const { isPhaseOneDone, invalidateOnPhaseOneDone, invalidateOnComplete } =
      configRef.current;

    if (
      invalidateOnPhaseOneDone &&
      isPhaseOneDone?.(state) &&
      !phaseOneInvalidatedRef.current
    ) {
      phaseOneInvalidatedRef.current = true;
      dispatch(baseApi.util.invalidateTags(invalidateOnPhaseOneDone));
    }

    if (
      invalidateOnComplete &&
      state.status === "completed" &&
      !completeInvalidatedRef.current
    ) {
      completeInvalidatedRef.current = true;
      dispatch(baseApi.util.invalidateTags(invalidateOnComplete));
    }
  }, [state, path, dispatch]);

  return state;
}
