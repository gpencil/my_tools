import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IMAGE_FILE_ACCEPT } from '../../lib/image-pdf/imageFiles';
import { ImageToPdfTool } from './ImageToPdfTool';

vi.mock('../../lib/image-pdf/createImagePdf', () => ({
  createImagePdf: vi.fn(async () => new Blob(['pdf'], { type: 'application/pdf' }))
}));

function file(name: string, type: string) {
  return new File(['sample'], name, { type });
}

describe('ImageToPdfTool', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:pdf')
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn()
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lets users select multiple local images and generate one pdf', async () => {
    render(<ImageToPdfTool />);

    const input = screen.getByLabelText('选择图片文件');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', IMAGE_FILE_ACCEPT);

    fireEvent.change(input, {
      target: {
        files: [file('营业执照.jpg', 'image/jpeg'), file('门头.png', 'image/png'), file('说明.txt', 'text/plain')]
      }
    });

    expect(screen.getByText('营业执照.jpg')).toBeInTheDocument();
    expect(screen.getByText('门头.png')).toBeInTheDocument();
    expect(screen.getByText('已忽略 1 个不支持的文件')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '生成 PDF' }));

    await waitFor(() => {
      expect(screen.getByText('PDF 已生成')).toBeInTheDocument();
    });

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});
