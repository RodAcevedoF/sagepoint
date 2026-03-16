import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRoadmapEvents } from "@/common/hooks/useRoadmapEvents";

// ─── EventSource mock ───────────────────────────────────────────────────────

type EventSourceHandler = ((event: MessageEvent) => void) | null;
type ErrorHandler = (() => void) | null;

let lastInstance: {
  onmessage: EventSourceHandler;
  onerror: ErrorHandler;
  close: ReturnType<typeof vi.fn>;
  url: string;
} | null = null;

function mockEventSource(url: string) {
  const instance = {
    url,
    onmessage: null as EventSourceHandler,
    onerror: null as ErrorHandler,
    close: vi.fn(),
  };
  lastInstance = instance;
  return instance;
}

function sendMessage(data: Record<string, unknown>) {
  if (!lastInstance?.onmessage) throw new Error("No EventSource listener");
  lastInstance.onmessage(
    new MessageEvent("message", { data: JSON.stringify(data) }),
  );
}

function triggerError() {
  if (!lastInstance?.onerror) throw new Error("No EventSource error handler");
  lastInstance.onerror();
}

beforeEach(() => {
  lastInstance = null;
  vi.stubGlobal("EventSource", vi.fn(mockEventSource));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRoadmapEvents", () => {
  describe("when roadmapId is null", () => {
    it("returns initial state without connecting", () => {
      const { result } = renderHook(() => useRoadmapEvents(null));

      expect(result.current.status).toBe("connecting");
      expect(result.current.stage).toBeNull();
      expect(result.current.errorMessage).toBeNull();
      expect(EventSource).not.toHaveBeenCalled();
    });
  });

  describe("when roadmapId is provided", () => {
    it("connects to SSE endpoint with credentials", () => {
      renderHook(() => useRoadmapEvents("r1"));

      expect(EventSource).toHaveBeenCalledWith(
        "http://localhost:3001/roadmaps/r1/events",
        { withCredentials: true },
      );
    });

    it('updates status on "status" event', () => {
      const { result } = renderHook(() => useRoadmapEvents("r1"));

      act(() => {
        sendMessage({ type: "status", status: "pending" });
      });

      expect(result.current.status).toBe("pending");
    });

    it('updates stage on "progress" event', () => {
      const { result } = renderHook(() => useRoadmapEvents("r1"));

      act(() => {
        sendMessage({ type: "progress", stage: "concepts" });
      });

      expect(result.current.status).toBe("processing");
      expect(result.current.stage).toBe("concepts");
    });

    it("transitions through all stages", () => {
      const { result } = renderHook(() => useRoadmapEvents("r1"));

      act(() => sendMessage({ type: "progress", stage: "concepts" }));
      expect(result.current.stage).toBe("concepts");

      act(() => sendMessage({ type: "progress", stage: "learning-path" }));
      expect(result.current.stage).toBe("learning-path");

      act(() => sendMessage({ type: "progress", stage: "resources" }));
      expect(result.current.stage).toBe("resources");

      act(() => sendMessage({ type: "completed" }));
      expect(result.current.status).toBe("completed");
      expect(result.current.stage).toBe("done");
    });

    it('closes EventSource on "completed"', () => {
      renderHook(() => useRoadmapEvents("r1"));

      act(() => {
        sendMessage({ type: "completed" });
      });

      expect(lastInstance!.close).toHaveBeenCalled();
    });

    it('sets error and closes on "failed"', () => {
      const { result } = renderHook(() => useRoadmapEvents("r1"));

      act(() => {
        sendMessage({ type: "failed", message: "LLM quota exceeded" });
      });

      expect(result.current.status).toBe("failed");
      expect(result.current.errorMessage).toBe("LLM quota exceeded");
      expect(lastInstance!.close).toHaveBeenCalled();
    });

    it('sets error on "error" event type', () => {
      const { result } = renderHook(() => useRoadmapEvents("r1"));

      act(() => {
        sendMessage({ type: "error", message: "Internal error" });
      });

      expect(result.current.status).toBe("failed");
      expect(result.current.errorMessage).toBe("Internal error");
    });

    it('sets status to "connecting" on connection error', () => {
      const { result } = renderHook(() => useRoadmapEvents("r1"));

      // First move to processing
      act(() => sendMessage({ type: "progress", stage: "concepts" }));
      expect(result.current.status).toBe("processing");

      // Connection drops
      act(() => triggerError());
      expect(result.current.status).toBe("connecting");
    });

    it("closes EventSource on unmount", () => {
      const { unmount } = renderHook(() => useRoadmapEvents("r1"));

      unmount();

      expect(lastInstance!.close).toHaveBeenCalled();
    });

    it("ignores malformed JSON messages", () => {
      const { result } = renderHook(() => useRoadmapEvents("r1"));

      act(() => {
        lastInstance!.onmessage!(
          new MessageEvent("message", { data: "not-json" }),
        );
      });

      // Should stay in initial state
      expect(result.current.status).toBe("connecting");
    });
  });
});
