export type UserTextRejectionReason =
  | "EMPTY"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_CHARS"
  | "PROMPT_INJECTION";

export interface UserTextValidationOk {
  ok: true;
  value: string;
}

export interface UserTextValidationErr {
  ok: false;
  reason: UserTextRejectionReason;
}

export type UserTextValidation = UserTextValidationOk | UserTextValidationErr;

export interface UserTextLimits {
  minLength: number;
  maxLength: number;
}

const DEFAULT_LIMITS: UserTextLimits = {
  minLength: 2,
  maxLength: 280,
};

const INJECTION_PATTERNS: RegExp[] = [
  /\bignore\s+(all\s+|the\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?|messages?)\b/i,
  /\bdisregard\s+(all\s+|the\s+)?(previous|prior|above)\b/i,
  /^\s*(system|assistant|user)\s*[:>]/im,
  /<\|(im_start|im_end|system|user|assistant)\|>/i,
  /\byou\s+are\s+now\b[^.\n]{0,80}\b(dan|jailbreak|developer\s+mode|sudo)\b/i,
  /\bsystem\s+(prompt|message|instructions?)\b[^.\n]{0,40}\b(reveal|show|print|leak|repeat|output)\b/i,
  /\b(reveal|show|print|leak|repeat|output)\b[^.\n]{0,40}\bsystem\s+(prompt|message|instructions?)\b/i,
];

function hasUnsafeCodePoints(text: string): boolean {
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp === undefined) continue;
    // Allow common whitespace: tab, LF, CR.
    if (cp === 0x09 || cp === 0x0a || cp === 0x0d) continue;
    // C0 controls + DEL.
    if (cp <= 0x1f || cp === 0x7f) return true;
    // C1 controls.
    if (cp >= 0x80 && cp <= 0x9f) return true;
    // Zero-width: ZWSP, ZWNJ, ZWJ, LRM, RLM, ZWNBSP.
    if (
      cp === 0x200b ||
      cp === 0x200c ||
      cp === 0x200d ||
      cp === 0x200e ||
      cp === 0x200f ||
      cp === 0xfeff
    ) {
      return true;
    }
    // Bidi overrides + isolates: LRE..RLO, LRI..PDI.
    if (cp >= 0x202a && cp <= 0x202e) return true;
    if (cp >= 0x2066 && cp <= 0x2069) return true;
  }
  return false;
}

export function validateUserText(
  input: string,
  limits?: Partial<UserTextLimits>,
): UserTextValidation {
  const { minLength, maxLength } = { ...DEFAULT_LIMITS, ...limits };
  const trimmed = input.trim();

  if (trimmed.length === 0) return { ok: false, reason: "EMPTY" };
  if (trimmed.length < minLength) return { ok: false, reason: "TOO_SHORT" };
  if (trimmed.length > maxLength) return { ok: false, reason: "TOO_LONG" };
  if (hasUnsafeCodePoints(trimmed))
    return { ok: false, reason: "INVALID_CHARS" };
  if (INJECTION_PATTERNS.some((re) => re.test(trimmed))) {
    return { ok: false, reason: "PROMPT_INJECTION" };
  }

  return { ok: true, value: trimmed };
}
