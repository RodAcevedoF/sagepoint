"use client";

import { useState, useEffect, useRef } from "react";

export type SseStatus =
  | "connecting"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface SseState<TStage extends string = string> {
  status: SseStatus;
  stage: TStage | null;
  errorMessage: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Generic SSE subscription hook.
 * @param path - API path (e.g. "/documents/{id}/events"), or null to skip
 * @param completedStage - stage value to set on "completed" event
 */
export function useSseEvents<TStage extends string>(
  path: string | null,
  completedStage: TStage,
): SseState<TStage> {
  const [prevPath, setPrevPath] = useState(path);
  const [state, setState] = useState<SseState<TStage>>({
    status: "connecting",
    stage: null,
    errorMessage: null,
  });

  if (prevPath !== path) {
    setPrevPath(path);
    setState({ status: "connecting", stage: null, errorMessage: null });
  }

  const completedStageRef = useRef(completedStage);
  useEffect(() => {
    completedStageRef.current = completedStage;
  }, [completedStage]);

  useEffect(() => {
    if (!path) return;

    const url = `${API_URL}${path}`;
    const es = new EventSource(url, { withCredentials: true });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          type: string;
          stage?: string;
          status?: string;
          message?: string;
        };

        switch (data.type) {
          case "status":
            setState({
              status: (data.status as SseStatus) || "pending",
              stage: (data.stage as TStage) ?? null,
              errorMessage: null,
            });
            break;
          case "progress":
            setState({
              status: "processing",
              stage: (data.stage as TStage) ?? null,
              errorMessage: null,
            });
            break;
          case "completed":
          case "partial-complete":
            setState({
              status: "completed",
              stage: completedStageRef.current,
              errorMessage: null,
            });
            es.close();
            break;
          case "failed":
          case "error":
            setState({
              status: "failed",
              stage: null,
              errorMessage: data.message || "Processing failed",
            });
            es.close();
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      setState((prev) => ({ ...prev, status: "connecting" }));
    };

    return () => es.close();
  }, [path]);

  return state;
}
