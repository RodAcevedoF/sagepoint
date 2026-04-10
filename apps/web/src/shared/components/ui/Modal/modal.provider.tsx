"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import { Modal } from "./Modal";
import { ModalContext, type ModalOptions } from "./modal-context";

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_OPTIONS: ModalOptions = {
  maxWidth: "sm",
  showCloseButton: true,
  closeOnOverlay: true,
};

// ============================================================================
// Provider
// ============================================================================

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [params, setParams] = useState<unknown>(null);
  const [options, setOptions] = useState<ModalOptions>(DEFAULT_OPTIONS);

  const openModal = useCallback(
    (c: ReactNode, opts?: ModalOptions, p?: unknown) => {
      setContent(c);
      setOptions({ ...DEFAULT_OPTIONS, ...opts });
      setParams(p);
      setIsOpen(true);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (options.onClose) {
      options.onClose();
    }
    // Delay clearing content for exit animation
    setTimeout(() => {
      setContent(null);
      setOptions(DEFAULT_OPTIONS);
      setParams(null);
    }, 200);
  }, [options]);

  const value = useMemo(
    () => ({ isOpen, content, params, options, openModal, closeModal }),
    [isOpen, content, params, options, openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal />
    </ModalContext.Provider>
  );
}
