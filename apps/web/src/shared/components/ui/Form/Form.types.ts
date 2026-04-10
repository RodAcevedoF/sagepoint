import { ReactNode } from "react";

export interface FormContextValue {
  error?: string;
}

export interface FormProps<T extends FormContextValue = FormContextValue> {
  children: ReactNode;
  action: (prevState: T, formData: FormData) => T | Promise<T>;
}

export interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

export interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

export interface FormSubmitProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export interface FormDividerProps {
  children?: ReactNode;
}

export type OAuthProvider = "google";

export interface FormOAuthProps {
  provider: OAuthProvider;
  label?: string;
}

export interface FormLinkProps {
  href: string;
  children: ReactNode;
}
