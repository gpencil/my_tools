import { startTransition, useEffect, useState } from 'react';

import { parseAndFormatJson, type JsonFormatResult } from '../../../lib/json/parseAndFormatJson';
import { MonacoTextEditor } from '../editor/MonacoTextEditor';

export function JsonFormatterPage() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<JsonFormatResult | null>(null);

  useEffect(() => {
    startTransition(() => {
      if (inputText.trim().length === 0) {
        setResult(null);
        return;
      }

      const nextResult = parseAndFormatJson(inputText);
      setResult(nextResult);

      if (nextResult.ok && nextResult.formattedText !== inputText) {
        setInputText(nextResult.formattedText);
      }
    });
  }, [inputText]);

  return (
    <section className="tool-panel">
      {result && !result.ok ? (
        <div className="status-banner status-banner--error">
          解析失败：<strong>{result.errorMessage}</strong>
          <div className="mono">
            line {result.errorLine}, column {result.errorColumn}, offset {result.errorOffset}
          </div>
        </div>
      ) : null}

      <div className="editor-grid editor-grid--single">
        <MonacoTextEditor
          panelTitle="JSON 内容"
          path="json-input.json"
          language="json"
          value={inputText}
          onChange={setInputText}
          showHeader={false}
        />
      </div>
    </section>
  );
}
