import { describe, expect, it } from 'vitest';

import { computeLineDiff } from './computeLineDiff';

describe('computeLineDiff', () => {
  it('keeps later lines aligned when the left side inserts a line', () => {
    const result = computeLineDiff('第一行\n多出来的一行\n第二行\n第三行', '第一行\n第二行\n第三行');

    expect(result.chunks).toEqual([
      {
        type: 'equal',
        leftStartLine: 1,
        leftEndLine: 1,
        rightStartLine: 1,
        rightEndLine: 1
      },
      {
        type: 'left_only',
        leftStartLine: 2,
        leftEndLine: 2,
        rightStartLine: 2,
        rightEndLine: 1
      },
      {
        type: 'equal',
        leftStartLine: 3,
        leftEndLine: 4,
        rightStartLine: 2,
        rightEndLine: 3
      }
    ]);
  });

  it('treats trim-only differences as equal', () => {
    const result = computeLineDiff(' 第一行 \n第二行', '第一行\n第二行   ');

    expect(result.chunks).toEqual([
      {
        type: 'equal',
        leftStartLine: 1,
        leftEndLine: 2,
        rightStartLine: 1,
        rightEndLine: 2
      }
    ]);
  });

  it('groups opposing unmatched blocks into a modified chunk', () => {
    const result = computeLineDiff('第一行\n旧内容\n第三行', '第一行\n新内容\n第三行');

    expect(result.chunks).toEqual([
      {
        type: 'equal',
        leftStartLine: 1,
        leftEndLine: 1,
        rightStartLine: 1,
        rightEndLine: 1
      },
      {
        type: 'modified',
        leftStartLine: 2,
        leftEndLine: 2,
        rightStartLine: 2,
        rightEndLine: 2
      },
      {
        type: 'equal',
        leftStartLine: 3,
        leftEndLine: 3,
        rightStartLine: 3,
        rightEndLine: 3
      }
    ]);
  });
});
