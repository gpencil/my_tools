import { fireEvent, render, screen } from '@testing-library/react';
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

import { App } from './App';

describe('App', () => {
  it('opens directly into the tool workspace without app-level chrome', () => {
    render(<App />);

    expect(screen.getByRole('navigation', { name: '工具导航' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '文本工具箱' })).toHaveClass('tool-tabs__item--active');
    expect(screen.getByRole('link', { name: '图片转 PDF' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'JSON 格式化' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('heading', { name: 'JSON 格式化' })).not.toBeInTheDocument();
    expect(screen.queryByText('粘贴单行或多行 JSON，右侧会实时输出结构化结果。')).not.toBeInTheDocument();
    expect(screen.queryByText('严格 JSON')).not.toBeInTheDocument();
    expect(screen.queryByText('实时解析')).not.toBeInTheDocument();
    expect(screen.queryByText('右侧只读')).not.toBeInTheDocument();
    expect(screen.queryByText('MY_TOOLS')).not.toBeInTheDocument();
    expect(screen.queryByText('本地多工具主应用')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '文本工具箱' })).not.toBeInTheDocument();
    expect(screen.queryByText('原始 JSON')).not.toBeInTheDocument();
    expect(screen.queryByText('结构化结果')).not.toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);

    fireEvent.click(screen.getByRole('tab', { name: '文本比对' }));

    expect(screen.getByRole('tab', { name: '文本比对' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('heading', { name: '文本比对' })).not.toBeInTheDocument();
    expect(screen.queryByText('左右文本按行实时比对，插入一行后后续内容会重新对齐。')).not.toBeInTheDocument();
    expect(screen.queryByText('差异块')).not.toBeInTheDocument();
    expect(screen.queryByText('左侧独有')).not.toBeInTheDocument();
    expect(screen.queryByText('右侧独有')).not.toBeInTheDocument();
    expect(screen.queryByText('修改')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '左侧文本' })).not.toHaveAttribute('placeholder');
    expect(screen.getByRole('textbox', { name: '右侧文本' })).not.toHaveAttribute('placeholder');
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('opens the image to pdf tool from the tool navigation', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('link', { name: '图片转 PDF' }));

    expect(screen.getByRole('link', { name: '图片转 PDF' })).toHaveClass('tool-tabs__item--active');
    expect(screen.getByLabelText('选择图片文件')).toHaveAttribute('multiple');
    expect(screen.queryByRole('tab', { name: 'JSON 格式化' })).not.toBeInTheDocument();
  });
});
