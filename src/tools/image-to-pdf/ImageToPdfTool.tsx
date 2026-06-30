import { useRef, useState, type ChangeEvent } from 'react';

import { createImagePdf } from '../../lib/image-pdf/createImagePdf';
import { IMAGE_FILE_ACCEPT, splitImageFiles } from '../../lib/image-pdf/imageFiles';

type StatusState =
  | {
      type: 'idle';
      message: string;
    }
  | {
      type: 'success';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

export function ImageToPdfTool() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [status, setStatus] = useState<StatusState>({
    type: 'idle',
    message: '请选择图片'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const result = splitImageFiles(event.target.files);

    setSelectedFiles(result.accepted);
    setRejectedCount(result.rejected.length);
    setStatus({
      type: 'idle',
      message: result.accepted.length > 0 ? `已选择 ${result.accepted.length} 张图片` : '请选择图片'
    });
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setStatus({ type: 'idle', message: '正在生成 PDF' });

      const pdfBlob = await createImagePdf(selectedFiles);
      downloadBlob(pdfBlob, getPdfFileName(selectedFiles));
      setStatus({ type: 'success', message: 'PDF 已生成' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'PDF 生成失败'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="tool-page">
      <div className="tool-panel image-pdf-panel">
        <div className="image-pdf-actions">
          <label className="image-pdf-upload">
            <span>选择图片文件</span>
            <input
              ref={inputRef}
              type="file"
              accept={IMAGE_FILE_ACCEPT}
              multiple
              aria-label="选择图片文件"
              onChange={handleFileChange}
            />
          </label>

          <button
            type="button"
            className="image-pdf-button"
            disabled={selectedFiles.length === 0 || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? '生成中' : '生成 PDF'}
          </button>
        </div>

        <div className={`status-banner status-banner--${status.type}`}>{status.message}</div>

        {rejectedCount > 0 ? (
          <div className="status-banner status-banner--error">已忽略 {rejectedCount} 个不支持的文件</div>
        ) : null}

        {selectedFiles.length > 0 ? (
          <ol className="image-pdf-list" aria-label="已选择图片">
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${file.lastModified}-${index}`} className="image-pdf-list__item">
                <span className="image-pdf-list__index">{index + 1}</span>
                <span className="image-pdf-list__name">{file.name}</span>
                <span className="image-pdf-list__size">{formatFileSize(file.size)}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

function getPdfFileName(files: File[]) {
  if (files.length === 1) {
    return `${stripExtension(files[0].name)}.pdf`;
  }

  return `images-${files.length}.pdf`;
}

function stripExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(Math.round(size / 1024), 1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, fileName: string) {
  if (typeof URL.createObjectURL !== 'function') {
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
