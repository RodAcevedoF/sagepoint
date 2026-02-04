"use client";

import { createContext, type ReactNode, useContext } from "react";

export type ModalOptions = {
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  onClose?: () => void;
};

type ModalContextType = {
  isOpen: boolean;
  content: ReactNode | null;
  params?: unknown;
  options: ModalOptions;
  openModal: (
    content: ReactNode,
    options?: ModalOptions,
    params?: unknown,
  ) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined,
);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};

export const useParams = <T,>() => {
  const { params } = useModal();
  return params as T;
};
