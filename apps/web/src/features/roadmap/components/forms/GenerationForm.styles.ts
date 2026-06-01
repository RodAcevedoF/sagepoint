import { aurora, auroraTint } from "@/shared/theme";

const auroraTextField = {
  "& .MuiOutlinedInput-root": {
    borderRadius: aurora.radii.md,
    background: aurora.surface,
    color: aurora.txHi,
    fontFamily: aurora.font.ui,
    transition:
      "background-color .2s ease, border-color .2s ease, box-shadow .2s ease",
    "& fieldset": {
      borderColor: aurora.line,
      transition: "border-color .2s ease",
    },
    "&:hover": {
      background: aurora.surface2,
      "& fieldset": { borderColor: aurora.line2 },
    },
    "&.Mui-focused": {
      background: aurora.surface2,
      boxShadow: `0 0 0 4px ${auroraTint(aurora.teal, 0.18)}`,
      "& fieldset": { borderColor: aurora.teal, borderWidth: "1px" },
    },
    "&.Mui-disabled": {
      background: aurora.surface,
      color: aurora.txLow,
      "& fieldset": { borderColor: aurora.line },
    },
  },
  "& .MuiInputBase-input": {
    color: aurora.txHi,
    "&::placeholder": { color: aurora.txLow, opacity: 1 },
    "&.Mui-disabled": { WebkitTextFillColor: aurora.txLow },
  },
  "& .MuiInputLabel-root": {
    color: aurora.txLow,
    fontFamily: aurora.font.ui,
    "&.Mui-focused": { color: aurora.teal },
  },
  "& .MuiFormHelperText-root": {
    color: aurora.txLow,
    fontFamily: aurora.font.ui,
  },
};

export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    py: 1,
  },
  textField: auroraTextField,
  errorText: {
    color: aurora.status.fail,
    fontFamily: aurora.font.ui,
  },
};
