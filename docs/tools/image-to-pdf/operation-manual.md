# 图片转 PDF 操作手册

## 功能范围

- 支持从本地多选 JPG、PNG、WebP、GIF、BMP、SVG 图片。
- 按选择顺序生成一个 PDF，每张图片对应一页，每页尺寸和方向跟随对应图片。
- 全程在浏览器本地处理，不上传图片文件。

## 使用方式

1. 打开主应用后切到 `图片转 PDF`。
2. 点击 `选择图片文件`，从本地选择一张或多张图片。
3. 确认列表顺序后点击 `生成 PDF`。
4. 浏览器会下载生成好的 PDF。

## 处理规则

- 不支持的文件会被忽略，并在页面提示数量。
- 单张图片导出的文件名跟随原图片名；多张图片会合并到一个 PDF，导出为 `images-<数量>.pdf`。
- 横图和竖图可以混合选择，生成时每一页会单独匹配对应图片方向。
- PNG、SVG 等透明背景图片会以白色背景写入 PDF。
- GIF 会按浏览器当前解码结果写入静态页面。

## 验证方式

```bash
npm run test -- src/lib/image-pdf/imageFiles.test.ts src/lib/image-pdf/createImagePdf.test.ts src/tools/image-to-pdf/ImageToPdfTool.test.tsx
npm run build
```
