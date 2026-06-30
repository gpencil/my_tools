import type * as Monaco from 'monaco-editor';

let themeRegistered = false;

export function ensureToolboxTheme(monaco: typeof Monaco) {
  if (themeRegistered) {
    return;
  }

  monaco.editor.defineTheme('toolbox-daybreak', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string', foreground: '7b5238' },
      { token: 'number', foreground: '2f5364' },
      { token: 'keyword', foreground: '9a3d2d' }
    ],
    colors: {
      'editor.background': '#fffdfa',
      'editorLineNumber.foreground': '#a08a75',
      'editorLineNumber.activeForeground': '#2f5364',
      'editorGutter.background': '#fffdfa',
      'editorIndentGuide.background1': '#eadfce',
      'editor.selectionBackground': '#d8e6ed',
      'editor.inactiveSelectionBackground': '#edf3f6',
      'editor.lineHighlightBackground': '#f7f0e5'
    }
  });

  themeRegistered = true;
}
