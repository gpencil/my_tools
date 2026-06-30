export type LoadedImageForPdf = {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
};

export type ImagePdfWriter = {
  addImagePage: (image: LoadedImageForPdf, options: { isFirstPage: boolean }) => void;
  toBlob: () => Blob;
};

export type ImagePdfDependencies = {
  loadImage?: (file: File) => Promise<LoadedImageForPdf>;
  createWriter?: (firstImage: LoadedImageForPdf) => ImagePdfWriter | Promise<ImagePdfWriter>;
};
