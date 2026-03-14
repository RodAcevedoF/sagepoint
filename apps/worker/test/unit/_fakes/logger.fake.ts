import type { PinoLogger } from "nestjs-pino";

export class FakeLogger implements Pick<
  PinoLogger,
  "info" | "warn" | "error" | "debug"
> {
  public messages: Array<{ level: string; args: unknown[] }> = [];

  info(...args: unknown[]) {
    this.messages.push({ level: "info", args });
  }
  warn(...args: unknown[]) {
    this.messages.push({ level: "warn", args });
  }
  error(...args: unknown[]) {
    this.messages.push({ level: "error", args });
  }
  debug(...args: unknown[]) {
    this.messages.push({ level: "debug", args });
  }
  log(...args: unknown[]) {
    this.messages.push({ level: "log", args });
  }

  hasLevel(level: string): boolean {
    return this.messages.some((m) => m.level === level);
  }

  clear() {
    this.messages = [];
  }
}
