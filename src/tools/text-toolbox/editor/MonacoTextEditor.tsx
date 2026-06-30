import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

import { ensureToolboxTheme } from './monacoTheme';

const DEFAULT_LINE_HEIGHT = 22;

type MonacoTextEditorProps = {
  panelTitle: string;
  panelHint?: string;
  path: string;
  value: string;
  language?: string;
  readOnly?: boolean;
  placeholder?: string;
  showHeader?: boolean;
  onChange?: (nextValue: string) => void;
  onMount?: OnMount;
  options?: Monaco.editor.IStandaloneEditorConstructionOptions;
};

export function MonacoTextEditor({
  panelTitle,
  panelHint,
  path,
  value,
  language = 'plaintext',
  readOnly = false,
  placeholder,
  showHeader = true,
  onChange,
  onMount,
  options
}: MonacoTextEditorProps) {
  return (
    <section className={showHeader ? 'editor-card' : 'editor-card editor-card--bare'}>
      {showHeader ? (
        <header className="editor-card__header">
          <span className="editor-card__title">{panelTitle}</span>
          {panelHint ? <span className="editor-card__hint">{panelHint}</span> : null}
        </header>
      ) : null}

      <div className="editor-card__surface">
        <Editor
          path={path}
          theme="toolbox-daybreak"
          language={language}
          value={value}
          beforeMount={ensureToolboxTheme}
          onMount={onMount}
          height="100%"
          onChange={(nextValue) => onChange?.(nextValue ?? '')}
          options={{
            automaticLayout: true,
            readOnly,
            ariaLabel: panelTitle,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontFamily: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
            fontSize: 14,
            lineHeight: DEFAULT_LINE_HEIGHT,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            folding: true,
            glyphMargin: false,
            overviewRulerLanes: 0,
            renderLineHighlight: 'line',
            wordWrap: 'on',
            padding: {
              top: 12,
              bottom: 12
            },
            placeholder,
            ...options
          }}
        />
      </div>
    </section>
  );
}

export const MONACO_LINE_HEIGHT = DEFAULT_LINE_HEIGHT;
