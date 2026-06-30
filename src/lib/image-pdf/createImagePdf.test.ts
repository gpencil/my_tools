import { describe, expect, it, vi } from 'vitest';

import { createImagePdf } from './createImagePdf';
import type { ImagePdfWriter, LoadedImageForPdf } from './types';

const SAMPLE_JPEG_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';

function file(name: string, type = 'image/png') {
  return new File(['sample'], name, { type });
}

describe('createImagePdf', () => {
  it('writes every selected image to one matching PDF page in order', async () => {
    const firstFile = file('first.png');
    const secondFile = file('second.jpg', 'image/jpeg');
    const loadedImages: LoadedImageForPdf[] = [
      {
        file: firstFile,
        dataUrl: 'data:image/jpeg;base64,first',
        width: 1200,
        height: 800
      },
      {
        file: secondFile,
        dataUrl: 'data:image/jpeg;base64,second',
        width: 640,
        height: 960
      }
    ];
    const writer: ImagePdfWriter = {
      addImagePage: vi.fn(),
      toBlob: vi.fn(() => new Blob(['pdf'], { type: 'application/pdf' }))
    };
    const loadImage = vi
      .fn<(file: File) => Promise<LoadedImageForPdf>>()
      .mockResolvedValueOnce(loadedImages[0])
      .mockResolvedValueOnce(loadedImages[1]);
    const createWriter = vi.fn<(image: LoadedImageForPdf) => ImagePdfWriter>().mockReturnValue(writer);

    const result = await createImagePdf([firstFile, secondFile], {
      createWriter,
      loadImage
    });

    expect(createWriter).toHaveBeenCalledOnce();
    expect(createWriter).toHaveBeenCalledWith(loadedImages[0]);
    expect(writer.addImagePage).toHaveBeenNthCalledWith(1, loadedImages[0], { isFirstPage: true });
    expect(writer.addImagePage).toHaveBeenNthCalledWith(2, loadedImages[1], { isFirstPage: false });
    expect(result.type).toBe('application/pdf');
  });

  it('creates one real pdf with mixed portrait and landscape page sizes', async () => {
    const portraitFile = file('portrait.jpg', 'image/jpeg');
    const landscapeFile = file('landscape.jpg', 'image/jpeg');

    const result = await createImagePdf([portraitFile, landscapeFile], {
      loadImage: async (selectedFile) =>
        selectedFile === portraitFile
          ? {
              file: portraitFile,
              dataUrl: SAMPLE_JPEG_DATA_URL,
              width: 640,
              height: 960
            }
          : {
              file: landscapeFile,
              dataUrl: SAMPLE_JPEG_DATA_URL,
              width: 1200,
              height: 800
            }
    });
    const pdfText = new TextDecoder('latin1').decode(await result.arrayBuffer());

    expect(result.type).toBe('application/pdf');
    expect(result.size).toBeGreaterThan(1000);
    expect(pdfText).toContain('/MediaBox [0 0 640. 960.]');
    expect(pdfText).toContain('/MediaBox [0 0 1200. 800.]');
  });

  it('rejects empty image selections', async () => {
    await expect(
      createImagePdf([], {
        createWriter: vi.fn(),
        loadImage: vi.fn()
      })
    ).rejects.toThrow('请先选择至少一张图片');
  });
});
