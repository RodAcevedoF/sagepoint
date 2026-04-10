"use client";

import { createContext, useContext } from "react";
import type { FormContextValue } from "./Form.types";

export const FormContext = createContext<FormContextValue>({});

export function useFormContext(): FormContextValue {
  return useContext(FormContext);
}
