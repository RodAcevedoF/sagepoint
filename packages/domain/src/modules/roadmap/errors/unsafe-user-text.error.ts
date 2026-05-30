import type { UserTextRejectionReason } from "../../../common/user-text";

export class UnsafeUserTextError extends Error {
  constructor(public readonly reason: UserTextRejectionReason) {
    super(`Rejected unsafe user text: ${reason}`);
    this.name = "UnsafeUserTextError";
  }
}
