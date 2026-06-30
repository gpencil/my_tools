import { describe, expect, it } from 'vitest';

import { parseAndFormatJson } from './parseAndFormatJson';

describe('parseAndFormatJson', () => {
  it('formats single-line valid json into indented output', () => {
    const result = parseAndFormatJson('{"agent_id":90036,"dialog":[{"role":"agent","text":"你好"}]}');

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected valid JSON to format successfully');
    }

    expect(result.formattedText).toContain('\n  "agent_id": 90036,');
    expect(result.formattedText).toContain('\n  "dialog": [');
  });

  it('returns an error with position details for invalid json', () => {
    const result = parseAndFormatJson('{"agent_id": 90036, "dialog": [}');

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Expected invalid JSON to produce a parse error');
    }

    expect(result.errorMessage).toBeTruthy();
    expect(result.errorOffset).toBeGreaterThanOrEqual(0);
    expect(result.errorLine).toBeGreaterThanOrEqual(1);
    expect(result.errorColumn).toBeGreaterThanOrEqual(1);
  });
});
