import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@monaco-editor/react', () => ({
  default: ({
    options,
    value,
    onChange
  }: {
    options?: { ariaLabel?: string; placeholder?: string };
    value?: string;
    onChange?: (nextValue: string) => void;
  }) => (
    <textarea
      aria-label={options?.ariaLabel ?? 'editor'}
      placeholder={options?.placeholder}
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    />
  )
}));

import { JsonFormatterPage } from './JsonFormatterPage';

describe('JsonFormatterPage', () => {
  it('formats valid single-line json inside the same editor', async () => {
    render(<JsonFormatterPage />);

    const editor = screen.getByRole('textbox', { name: 'JSON 内容' });

    fireEvent.change(editor, {
      target: {
        value: '{"agent_id":90062,"dialog":[{"role":"agent","text":"你好"}]}'
      }
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'JSON 内容' })).toHaveValue(
        '{\n  "agent_id": 90062,\n  "dialog": [\n    {\n      "role": "agent",\n      "text": "你好"\n    }\n  ]\n}'
      );
    });
  });
});
