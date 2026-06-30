import { parse, printParseErrorCode } from 'jsonc-parser';

export type JsonFormatResult =
  | {
      ok: true;
      formattedText: string;
    }
  | {
      ok: false;
      errorMessage: string;
      errorOffset: number;
      errorLine: number;
      errorColumn: number;
    };

export function parseAndFormatJson(input: string): JsonFormatResult {
  const errors: Array<{ error: number; offset: number; length: number }> = [];
  const value = parse(input, errors, {
    allowTrailingComma: false,
    disallowComments: true,
    allowEmptyContent: false
  });

  if (errors.length > 0) {
    const firstError = errors[0];
    const position = getLineAndColumn(input, firstError.offset);

    return {
      ok: false,
      errorMessage: printParseErrorCode(firstError.error),
      errorOffset: firstError.offset,
      errorLine: position.line,
      errorColumn: position.column
    };
  }

  return {
    ok: true,
    formattedText: JSON.stringify(value, null, 2)
  };
}

function getLineAndColumn(input: string, offset: number) {
  const safeOffset = Math.max(0, Math.min(offset, input.length));
  let line = 1;
  let column = 1;

  for (let index = 0; index < safeOffset; index += 1) {
    if (input[index] === '\n') {
      line += 1;
      column = 1;
      continue;
    }

    column += 1;
  }

  return { line, column };
}
