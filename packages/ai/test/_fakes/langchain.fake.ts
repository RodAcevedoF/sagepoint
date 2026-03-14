/**
 * Captures calls to ChatOpenAI → withStructuredOutput → invoke
 * and returns pre-configured results.
 */
export interface RecordedInvocation {
  messages: unknown[];
}

let _invokeResult: unknown = {};
let _invocations: RecordedInvocation[] = [];
let _invokeError: Error | null = null;

// Plain invoke result (for vision adapter which doesn't use structured output)
let _plainInvokeResult: unknown = { content: "" };

export function setInvokeResult(result: unknown): void {
  _invokeResult = result;
}

export function setInvokeError(error: Error): void {
  _invokeError = error;
}

export function setPlainInvokeResult(result: unknown): void {
  _plainInvokeResult = result;
}

export function getInvocations(): RecordedInvocation[] {
  return _invocations;
}

export function resetFake(): void {
  _invokeResult = {};
  _invocations = [];
  _invokeError = null;
  _plainInvokeResult = { content: "" };
}

const mockInvoke = jest.fn(async (messages: unknown[]) => {
  _invocations.push({ messages });
  if (_invokeError) throw _invokeError;
  return _invokeResult;
});

const mockPlainInvoke = jest.fn(async (messages: unknown[]) => {
  _invocations.push({ messages });
  if (_invokeError) throw _invokeError;
  return _plainInvokeResult;
});

const mockWithStructuredOutput = jest.fn(() => ({
  invoke: mockInvoke,
}));

jest.mock("@langchain/openai", () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    withStructuredOutput: mockWithStructuredOutput,
    invoke: mockPlainInvoke,
  })),
}));

export { mockInvoke, mockPlainInvoke, mockWithStructuredOutput };
