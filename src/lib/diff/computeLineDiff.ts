export type DiffChunkType = 'equal' | 'left_only' | 'right_only' | 'modified';

export type DiffChunk = {
  type: DiffChunkType;
  leftStartLine: number;
  leftEndLine: number;
  rightStartLine: number;
  rightEndLine: number;
};

export type AlignedRow = {
  leftLineNumber?: number;
  rightLineNumber?: number;
  leftText: string;
  rightText: string;
  chunkType: DiffChunkType;
};

export type LineDiffResult = {
  chunks: DiffChunk[];
  rows: AlignedRow[];
  leftLines: string[];
  rightLines: string[];
};

type RawChunk = {
  type: 'equal' | 'left_only' | 'right_only';
  leftStartIndex: number;
  leftEndIndex: number;
  rightStartIndex: number;
  rightEndIndex: number;
};

export function computeLineDiff(leftText: string, rightText: string): LineDiffResult {
  const leftLines = splitLines(leftText);
  const rightLines = splitLines(rightText);
  const normalizedLeft = leftLines.map((line) => line.trim());
  const normalizedRight = rightLines.map((line) => line.trim());
  const rawChunks = buildRawChunks(normalizedLeft, normalizedRight);
  const chunks = mergeModifiedChunks(rawChunks).map(toDiffChunk);

  return {
    chunks,
    rows: buildAlignedRows(chunks, leftLines, rightLines),
    leftLines,
    rightLines
  };
}

function splitLines(text: string) {
  if (text.length === 0) {
    return [];
  }

  return text.split(/\r?\n/);
}

function buildRawChunks(left: string[], right: string[]) {
  const leftCount = left.length;
  const rightCount = right.length;
  const lcs: number[][] = Array.from({ length: leftCount + 1 }, () =>
    Array.from({ length: rightCount + 1 }, () => 0)
  );

  for (let leftIndex = leftCount - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightCount - 1; rightIndex >= 0; rightIndex -= 1) {
      if (left[leftIndex] === right[rightIndex]) {
        lcs[leftIndex][rightIndex] = lcs[leftIndex + 1][rightIndex + 1] + 1;
      } else {
        lcs[leftIndex][rightIndex] = Math.max(
          lcs[leftIndex + 1][rightIndex],
          lcs[leftIndex][rightIndex + 1]
        );
      }
    }
  }

  const chunks: RawChunk[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftCount && rightIndex < rightCount) {
    if (left[leftIndex] === right[rightIndex]) {
      pushRawChunk(chunks, {
        type: 'equal',
        leftStartIndex: leftIndex,
        leftEndIndex: leftIndex,
        rightStartIndex: rightIndex,
        rightEndIndex: rightIndex
      });
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }

    if (lcs[leftIndex + 1][rightIndex] >= lcs[leftIndex][rightIndex + 1]) {
      pushRawChunk(chunks, {
        type: 'left_only',
        leftStartIndex: leftIndex,
        leftEndIndex: leftIndex,
        rightStartIndex: rightIndex,
        rightEndIndex: rightIndex - 1
      });
      leftIndex += 1;
      continue;
    }

    pushRawChunk(chunks, {
      type: 'right_only',
      leftStartIndex: leftIndex,
      leftEndIndex: leftIndex - 1,
      rightStartIndex: rightIndex,
      rightEndIndex: rightIndex
    });
    rightIndex += 1;
  }

  while (leftIndex < leftCount) {
    pushRawChunk(chunks, {
      type: 'left_only',
      leftStartIndex: leftIndex,
      leftEndIndex: leftIndex,
      rightStartIndex: rightIndex,
      rightEndIndex: rightIndex - 1
    });
    leftIndex += 1;
  }

  while (rightIndex < rightCount) {
    pushRawChunk(chunks, {
      type: 'right_only',
      leftStartIndex: leftIndex,
      leftEndIndex: leftIndex - 1,
      rightStartIndex: rightIndex,
      rightEndIndex: rightIndex
    });
    rightIndex += 1;
  }

  return chunks;
}

function pushRawChunk(chunks: RawChunk[], next: RawChunk) {
  const previous = chunks[chunks.length - 1];

  if (
    previous &&
    previous.type === next.type &&
    previous.leftEndIndex + 1 === next.leftStartIndex &&
    previous.rightEndIndex + 1 === next.rightStartIndex
  ) {
    previous.leftEndIndex = next.leftEndIndex;
    previous.rightEndIndex = next.rightEndIndex;
    return;
  }

  chunks.push(next);
}

function mergeModifiedChunks(rawChunks: RawChunk[]) {
  const merged: Array<RawChunk | (Omit<RawChunk, 'type'> & { type: 'modified' })> = [];

  for (let index = 0; index < rawChunks.length; index += 1) {
    const current = rawChunks[index];
    const next = rawChunks[index + 1];

    if (
      next &&
      ((current.type === 'left_only' && next.type === 'right_only') ||
        (current.type === 'right_only' && next.type === 'left_only'))
    ) {
      merged.push({
        type: 'modified',
        leftStartIndex: Math.min(current.leftStartIndex, next.leftStartIndex),
        leftEndIndex: Math.max(current.leftEndIndex, next.leftEndIndex),
        rightStartIndex: Math.min(current.rightStartIndex, next.rightStartIndex),
        rightEndIndex: Math.max(current.rightEndIndex, next.rightEndIndex)
      });
      index += 1;
      continue;
    }

    merged.push(current);
  }

  return merged;
}

function toDiffChunk(
  chunk: RawChunk | (Omit<RawChunk, 'type'> & { type: 'modified' })
): DiffChunk {
  return {
    type: chunk.type,
    leftStartLine: chunk.leftStartIndex + 1,
    leftEndLine: chunk.leftEndIndex + 1,
    rightStartLine: chunk.rightStartIndex + 1,
    rightEndLine: chunk.rightEndIndex + 1
  };
}

function buildAlignedRows(chunks: DiffChunk[], leftLines: string[], rightLines: string[]) {
  const rows: AlignedRow[] = [];

  for (const chunk of chunks) {
    const leftStartIndex = Math.max(chunk.leftStartLine - 1, 0);
    const rightStartIndex = Math.max(chunk.rightStartLine - 1, 0);
    const leftCount = Math.max(chunk.leftEndLine - chunk.leftStartLine + 1, 0);
    const rightCount = Math.max(chunk.rightEndLine - chunk.rightStartLine + 1, 0);
    const rowCount = Math.max(leftCount, rightCount);

    if (rowCount === 0) {
      continue;
    }

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const leftHasLine = rowIndex < leftCount;
      const rightHasLine = rowIndex < rightCount;

      rows.push({
        leftLineNumber: leftHasLine ? chunk.leftStartLine + rowIndex : undefined,
        rightLineNumber: rightHasLine ? chunk.rightStartLine + rowIndex : undefined,
        leftText: leftHasLine ? leftLines[leftStartIndex + rowIndex] ?? '' : '',
        rightText: rightHasLine ? rightLines[rightStartIndex + rowIndex] ?? '' : '',
        chunkType: chunk.type
      });
    }
  }

  return rows;
}
