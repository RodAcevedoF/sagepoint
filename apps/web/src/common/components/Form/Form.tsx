"use client";

import { useActionState } from "react";
import { Card } from "@/common/components/Card";
import { FormContext } from "./FormContext";
import type { FormProps, FormContextValue } from "./Form.types";

const initialState: FormContextValue = { error: undefined };

export function Form<T extends FormContextValue>({
  children,
  action,
}: FormProps<T>) {
  const [state, formAction] = useActionState(
    action as (state: Awaited<T>, payload: FormData) => T | Promise<T>,
    initialState as unknown as Awaited<T>,
  );

  return (
    <FormContext.Provider value={{ error: state?.error }}>
      <Card variant="glass" hoverable={false} sx={{ p: { xs: 3, md: 5 } }}>
        <form action={formAction} noValidate style={{ width: "100%" }}>
          {children}
        </form>
      </Card>
    </FormContext.Provider>
  );
}
