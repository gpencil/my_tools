import { describe, expect, it } from 'vitest';

import { IMAGE_FILE_ACCEPT, splitImageFiles } from './imageFiles';

function file(name: string, type = '') {
  return new File(['sample'], name, { type });
}

describe('splitImageFiles', () => {
  it('keeps supported image files in the selected order and separates rejected files', () => {
    const jpeg = file('license.jpg', 'image/jpeg');
    const png = file('scan.png', 'image/png');
    const webp = file('receipt.webp', 'image/webp');
    const txt = file('notes.txt', 'text/plain');
    const extensionOnlySvg = file('diagram.svg');

    const result = splitImageFiles([jpeg, txt, png, webp, extensionOnlySvg]);

    expect(result.accepted).toEqual([jpeg, png, webp, extensionOnlySvg]);
    expect(result.rejected).toEqual([txt]);
  });
});

describe('IMAGE_FILE_ACCEPT', () => {
  it('declares common browser-decodable image formats for the native picker', () => {
    expect(IMAGE_FILE_ACCEPT).toBe('image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml');
  });
});
