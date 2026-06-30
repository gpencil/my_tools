import type { jsPDF as JsPdfDocument } from 'jspdf';

import type { ImagePdfDependencies, ImagePdfWriter, LoadedImageForPdf } from './types';

type PageOrientation = 'landscape' | 'portrait';
type JsPdfConstructor = new (options: {
  compress: boolean;
  format: [number, number];
  orientation: PageOrientation;
  unit: 'pt';
}) => JsPdfDocument;

export async function createImagePdf(files: File[], dependencies: ImagePdfDependencies = {}) {
  if (files.length === 0) {
    throw new Error('请先选择至少一张图片');
  }

  const loadImage = dependencies.loadImage ?? loadImageForPdf;
  const loadedImages: LoadedImageForPdf[] = [];

  for (const file of files) {
    loadedImages.push(await loadImage(file));
  }

  const createWriter = dependencies.createWriter ?? createJsPdfWriter;
  const writer = await createWriter(loadedImages[0]);

  loadedImages.forEach((image, index) => {
    writer.addImagePage(image, { isFirstPage: index === 0 });
  });

  return writer.toBlob();
}

async function loadImageForPdf(file: File): Promise<LoadedImageForPdf> {
  const image = await readImage(file);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (width <= 0 || height <= 0) {
    throw new Error(`无法读取图片尺寸：${file.name}`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('当前浏览器不支持图片转 PDF');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return {
    file,
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    width,
    height
  };
}

function readImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    image.onload = () => {
      cleanup();
      resolve(image);
    };
    image.onerror = () => {
      cleanup();
      reject(new Error(`无法读取图片文件：${file.name}`));
    };
    image.src = objectUrl;
  });
}

async function createJsPdfWriter(firstImage: LoadedImageForPdf): Promise<ImagePdfWriter> {
  const { jsPDF } = await import('jspdf');
  return new JsPdfImagePdfWriter(firstImage, jsPDF);
}

class JsPdfImagePdfWriter implements ImagePdfWriter {
  private readonly pdf: JsPdfDocument;

  constructor(firstImage: LoadedImageForPdf, PdfDocument: JsPdfConstructor) {
    this.pdf = new PdfDocument({
      compress: true,
      format: getPageFormat(firstImage),
      orientation: getPageOrientation(firstImage),
      unit: 'pt'
    });
  }

  addImagePage(image: LoadedImageForPdf, options: { isFirstPage: boolean }) {
    const width = getPageWidth(image);
    const height = getPageHeight(image);

    if (!options.isFirstPage) {
      this.pdf.addPage([width, height], getPageOrientation(image));
    }

    this.pdf.addImage(image.dataUrl, 'JPEG', 0, 0, width, height);
  }

  toBlob() {
    return this.pdf.output('blob');
  }
}

function getPageFormat(image: LoadedImageForPdf): [number, number] {
  return [getPageWidth(image), getPageHeight(image)];
}

function getPageWidth(image: LoadedImageForPdf) {
  return Math.max(image.width, 1);
}

function getPageHeight(image: LoadedImageForPdf) {
  return Math.max(image.height, 1);
}

function getPageOrientation(image: LoadedImageForPdf): PageOrientation {
  return image.width >= image.height ? 'landscape' : 'portrait';
}
