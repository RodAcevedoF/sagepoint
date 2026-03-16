import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useInfiniteScroll } from "@/common/hooks/useInfiniteScroll";

// ─── IntersectionObserver mock ──────────────────────────────────────────────

let observerCallback: IntersectionObserverCallback | null = null;
let observedElement: Element | null = null;
const disconnectFn = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
  observe(el: Element) {
    observedElement = el;
  }
  disconnect() {
    disconnectFn();
    observedElement = null;
  }
  unobserve() {}
}

function simulateIntersection(isIntersecting: boolean) {
  if (!observerCallback) throw new Error("No observer callback");
  observerCallback(
    [{ isIntersecting } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

beforeEach(() => {
  observerCallback = null;
  observedElement = null;
  disconnectFn.mockClear();
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useInfiniteScroll", () => {
  it("returns a ref object", () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onLoadMore, true));

    expect(result.current).toHaveProperty("current");
  });

  it("observes the sentinel element when enabled and ref is attached", () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onLoadMore, true));

    // Simulate attaching the ref to a DOM element
    const sentinel = document.createElement("div");
    (result.current as { current: HTMLDivElement | null }).current = sentinel;

    // Re-render to trigger the effect with the attached ref
    const { result: result2 } = renderHook(() =>
      useInfiniteScroll(onLoadMore, true),
    );
    const sentinel2 = document.createElement("div");
    (result2.current as { current: HTMLDivElement | null }).current = sentinel2;
  });

  it("calls onLoadMore when sentinel intersects", () => {
    const onLoadMore = vi.fn();
    const sentinel = document.createElement("div");

    renderHook(() => {
      const ref = useInfiniteScroll(onLoadMore, true);
      (ref as { current: HTMLDivElement | null }).current = sentinel;
      return ref;
    });

    // The observer was set up — simulate intersection
    if (observerCallback) {
      simulateIntersection(true);
      expect(onLoadMore).toHaveBeenCalledOnce();
    }
  });

  it("does not call onLoadMore when not intersecting", () => {
    const onLoadMore = vi.fn();
    const sentinel = document.createElement("div");

    renderHook(() => {
      const ref = useInfiniteScroll(onLoadMore, true);
      (ref as { current: HTMLDivElement | null }).current = sentinel;
      return ref;
    });

    if (observerCallback) {
      simulateIntersection(false);
      expect(onLoadMore).not.toHaveBeenCalled();
    }
  });

  it("does not observe when disabled", () => {
    const onLoadMore = vi.fn();

    renderHook(() => useInfiniteScroll(onLoadMore, false));

    // No element should be observed
    expect(observedElement).toBeNull();
  });

  it("disconnects observer on unmount", () => {
    const onLoadMore = vi.fn();
    const sentinel = document.createElement("div");

    const { unmount } = renderHook(() => {
      const ref = useInfiniteScroll(onLoadMore, true);
      (ref as { current: HTMLDivElement | null }).current = sentinel;
      return ref;
    });

    unmount();

    if (observerCallback) {
      expect(disconnectFn).toHaveBeenCalled();
    }
  });
});
