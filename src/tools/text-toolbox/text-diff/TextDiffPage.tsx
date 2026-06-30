import { startTransition, useEffect, useRef, useState } from 'react';
import type * as Monaco from 'monaco-editor';

import {
  computeLineDiff,
  type DiffChunk,
  type DiffChunkType,
  type LineDiffResult
} from '../../../lib/diff/computeLineDiff';
import { MONACO_LINE_HEIGHT, MonacoTextEditor } from '../editor/MonacoTextEditor';

export function TextDiffPage() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diffResult, setDiffResult] = useState<LineDiffResult>(() => computeLineDiff('', ''));
  const monacoRef = useRef<typeof Monaco | null>(null);
  const leftEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const rightEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const leftDecorationIdsRef = useRef<string[]>([]);
  const rightDecorationIdsRef = useRef<string[]>([]);
  const leftZoneIdsRef = useRef<string[]>([]);
  const rightZoneIdsRef = useRef<string[]>([]);
  const syncingScrollRef = useRef(false);

  useEffect(() => {
    startTransition(() => {
      setDiffResult(computeLineDiff(leftText, rightText));
    });
  }, [leftText, rightText]);

  useEffect(() => {
    const leftEditor = leftEditorRef.current;
    const rightEditor = rightEditorRef.current;

    if (!leftEditor || !rightEditor) {
      return;
    }

    const leftDisposable = leftEditor.onDidScrollChange((event) => {
      if ((!event.scrollTopChanged && !event.scrollLeftChanged) || syncingScrollRef.current) {
        return;
      }

      syncingScrollRef.current = true;
      rightEditor.setScrollTop(leftEditor.getScrollTop());
      rightEditor.setScrollLeft(leftEditor.getScrollLeft());
      syncingScrollRef.current = false;
    });

    const rightDisposable = rightEditor.onDidScrollChange((event) => {
      if ((!event.scrollTopChanged && !event.scrollLeftChanged) || syncingScrollRef.current) {
        return;
      }

      syncingScrollRef.current = true;
      leftEditor.setScrollTop(rightEditor.getScrollTop());
      leftEditor.setScrollLeft(rightEditor.getScrollLeft());
      syncingScrollRef.current = false;
    });

    return () => {
      leftDisposable.dispose();
      rightDisposable.dispose();
    };
  }, [leftEditorRef.current, rightEditorRef.current]);

  useEffect(() => {
    const monaco = monacoRef.current;
    const leftEditor = leftEditorRef.current;
    const rightEditor = rightEditorRef.current;

    if (!monaco || !leftEditor || !rightEditor) {
      return;
    }

    leftDecorationIdsRef.current = leftEditor.deltaDecorations(
      leftDecorationIdsRef.current,
      buildLineDecorations(monaco, diffResult.chunks, 'left')
    );
    rightDecorationIdsRef.current = rightEditor.deltaDecorations(
      rightDecorationIdsRef.current,
      buildLineDecorations(monaco, diffResult.chunks, 'right')
    );

    leftEditor.changeViewZones((accessor) => {
      for (const zoneId of leftZoneIdsRef.current) {
        accessor.removeZone(zoneId);
      }

      leftZoneIdsRef.current = buildZoneIds(accessor, diffResult.chunks, 'left');
    });

    rightEditor.changeViewZones((accessor) => {
      for (const zoneId of rightZoneIdsRef.current) {
        accessor.removeZone(zoneId);
      }

      rightZoneIdsRef.current = buildZoneIds(accessor, diffResult.chunks, 'right');
    });
  }, [diffResult]);

  return (
    <section className="tool-panel">
      <div className="editor-grid">
        <MonacoTextEditor
          panelTitle="左侧文本"
          path="diff-left.txt"
          value={leftText}
          onChange={setLeftText}
          onMount={(editor, monaco) => {
            monacoRef.current = monaco;
            leftEditorRef.current = editor;
          }}
        />

        <MonacoTextEditor
          panelTitle="右侧文本"
          path="diff-right.txt"
          value={rightText}
          onChange={setRightText}
          onMount={(editor, monaco) => {
            monacoRef.current = monaco;
            rightEditorRef.current = editor;
          }}
        />
      </div>
    </section>
  );
}

function buildLineDecorations(
  monaco: typeof Monaco,
  chunks: DiffChunk[],
  side: 'left' | 'right'
): Monaco.editor.IModelDeltaDecoration[] {
  const decorations: Monaco.editor.IModelDeltaDecoration[] = [];

  for (const chunk of chunks) {
    const startLine = side === 'left' ? chunk.leftStartLine : chunk.rightStartLine;
    const endLine = side === 'left' ? chunk.leftEndLine : chunk.rightEndLine;

    if (chunk.type === 'equal' || startLine <= 0 || endLine <= 0 || startLine > endLine) {
      continue;
    }

    if (chunk.type === 'left_only' && side !== 'left') {
      continue;
    }

    if (chunk.type === 'right_only' && side !== 'right') {
      continue;
    }

    decorations.push({
      range: new monaco.Range(startLine, 1, endLine, 1),
      options: {
        isWholeLine: true,
        className: getDecorationClassName(chunk.type)
      }
    });
  }

  return decorations;
}

function buildZoneIds(
  accessor: Monaco.editor.IViewZoneChangeAccessor,
  chunks: DiffChunk[],
  side: 'left' | 'right'
) {
  const zoneIds: string[] = [];

  for (const chunk of chunks) {
    const leftCount = getChunkLineCount(chunk.leftStartLine, chunk.leftEndLine);
    const rightCount = getChunkLineCount(chunk.rightStartLine, chunk.rightEndLine);

    if (leftCount === rightCount) {
      continue;
    }

    const sideCount = side === 'left' ? leftCount : rightCount;
    const missingCount = side === 'left' ? rightCount - leftCount : leftCount - rightCount;

    if (missingCount <= 0) {
      continue;
    }

    const afterLineNumber =
      sideCount === 0
        ? Math.max((side === 'left' ? chunk.leftStartLine : chunk.rightStartLine) - 1, 0)
        : side === 'left'
          ? chunk.leftEndLine
          : chunk.rightEndLine;

    const domNode = document.createElement('div');
    domNode.className = 'diff-zone';

    zoneIds.push(
      accessor.addZone({
        afterLineNumber,
        heightInPx: missingCount * MONACO_LINE_HEIGHT,
        domNode,
        suppressMouseDown: true
      })
    );
  }

  return zoneIds;
}

function getChunkLineCount(startLine: number, endLine: number) {
  if (startLine <= 0 || endLine <= 0 || endLine < startLine) {
    return 0;
  }

  return endLine - startLine + 1;
}

function getDecorationClassName(type: DiffChunkType) {
  switch (type) {
    case 'left_only':
      return 'diff-line--left-only';
    case 'right_only':
      return 'diff-line--right-only';
    case 'modified':
      return 'diff-line--modified';
    default:
      return '';
  }
}
