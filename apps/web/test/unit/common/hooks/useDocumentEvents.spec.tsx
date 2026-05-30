import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Provider } from "react-redux";
import { useDocumentEvents } from "@/shared/hooks/useDocumentEvents";
import { setupStore } from "@/infrastructure/store/store";
import { SnackbarProvider } from "@/shared/components/feedback/Snackbar/snackbar.provider";

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

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={setupStore()}>
      <SnackbarProvider>{children}</SnackbarProvider>
    </Provider>
  );
}

beforeEach(() => {
  lastInstance = null;
  vi.stubGlobal("EventSource", vi.fn(mockEventSource));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useDocumentEvents", () => {
  describe("when documentId is null", () => {
    it("returns initial state without connecting", () => {
      const { result } = renderHook(() => useDocumentEvents(null), { wrapper });

      expect(result.current.status).toBe("connecting");
      expect(result.current.stage).toBeNull();
      expect(result.current.errorMessage).toBeNull();
      expect(EventSource).not.toHaveBeenCalled();
    });
  });

  describe("when documentId is provided", () => {
    it("connects to SSE endpoint", () => {
      renderHook(() => useDocumentEvents("d1"), { wrapper });

      expect(EventSource).toHaveBeenCalledWith(
        "http://localhost:3001/documents/d1/events",
        { withCredentials: true },
      );
    });

    it('updates on "progress" event with stage', () => {
      const { result } = renderHook(() => useDocumentEvents("d1"), { wrapper });

      act(() => {
        sendMessage({ type: "progress", stage: "parsing" });
      });

      expect(result.current.status).toBe("processing");
      expect(result.current.stage).toBe("parsing");
    });

    it("transitions through document processing stages", () => {
      const { result } = renderHook(() => useDocumentEvents("d1"), { wrapper });

      act(() => sendMessage({ type: "progress", stage: "parsing" }));
      expect(result.current.stage).toBe("parsing");

      act(() => sendMessage({ type: "progress", stage: "analyzing" }));
      expect(result.current.stage).toBe("analyzing");

      act(() => sendMessage({ type: "progress", stage: "summarized" }));
      expect(result.current.stage).toBe("summarized");

      act(() => sendMessage({ type: "completed" }));
      expect(result.current.status).toBe("completed");
      expect(result.current.stage).toBe("ready");
    });

    it('closes connection on "completed"', () => {
      renderHook(() => useDocumentEvents("d1"), { wrapper });

      act(() => sendMessage({ type: "completed" }));

      expect(lastInstance!.close).toHaveBeenCalled();
    });

    it('sets error on "failed" and closes', () => {
      const { result } = renderHook(() => useDocumentEvents("d1"), { wrapper });

      act(() => {
        sendMessage({ type: "failed", message: "Parse error" });
      });

      expect(result.current.status).toBe("failed");
      expect(result.current.errorMessage).toBe("Parse error");
      expect(lastInstance!.close).toHaveBeenCalled();
    });

    it("closes EventSource on unmount", () => {
      const { unmount } = renderHook(() => useDocumentEvents("d1"), {
        wrapper,
      });
      unmount();
      expect(lastInstance!.close).toHaveBeenCalled();
    });
  });
});
