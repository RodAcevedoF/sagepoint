import { Form as FormRoot } from "./Form";
import { FormHeader } from "./FormHeader";
import { FormError } from "./FormError";
import { FormField } from "./FormField";
import { FormSubmit } from "./FormSubmit";
import { FormDivider } from "./FormDivider";
import { FormOAuth } from "./FormOAuth";
import { FormLink } from "./FormLink";

export type { FormProps, FormFieldProps, FormOAuthProps } from "./Form.types";
export { useFormContext } from "./FormContext";

export const Form = Object.assign(FormRoot, {
  Header: FormHeader,
  Error: FormError,
  Field: FormField,
  Submit: FormSubmit,
  Divider: FormDivider,
  OAuth: FormOAuth,
  Link: FormLink,
});
