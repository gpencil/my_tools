const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
const supportedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];

export const IMAGE_FILE_ACCEPT = supportedImageTypes.join(',');

export type SplitImageFilesResult = {
  accepted: File[];
  rejected: File[];
};

export function splitImageFiles(files: Iterable<File> | null | undefined): SplitImageFilesResult {
  const accepted: File[] = [];
  const rejected: File[] = [];

  if (!files) {
    return { accepted, rejected };
  }

  for (const file of Array.from(files)) {
    if (isSupportedImageFile(file)) {
      accepted.push(file);
    } else {
      rejected.push(file);
    }
  }

  return { accepted, rejected };
}

function isSupportedImageFile(file: File) {
  if (supportedImageTypes.includes(file.type.toLowerCase())) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return supportedImageExtensions.some((extension) => lowerName.endsWith(extension));
}
