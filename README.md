# my_tools

本仓库用于承载以后所有本地工具，不再为每个小工具单开一个项目。

当前形态是一个统一前端主应用，工具模块统一注册在主应用里。

## 启动方式

```bash
npm install
npm run dev
```

开发环境默认由 Vite 提供本地页面，常见地址是 `http://localhost:5173`。

## 可用命令

```bash
npm run dev
npm run build
npm run test
```

## 当前工具列表

### 文本工具箱

- `JSON 格式化`
  - 把单行或多行 JSON 实时展开成带行号的结构化结果
  - 非法 JSON 会直接显示错误位置
- `文本比对`
  - 左右按行实时比对
  - 支持中间插入/删除后的重新对齐
  - 仅忽略每行首尾空格

### 图片转 PDF

- 支持从本地多选 JPG、PNG、WebP、GIF、BMP、SVG 图片
- 按选择顺序生成一个 PDF，每张图片对应一页，横图和竖图会分别匹配页面方向
- 全程在浏览器本地处理，不上传图片文件

## 文档入口

- 操作手册：[docs/tools/text-toolbox/operation-manual.md](./docs/tools/text-toolbox/operation-manual.md)
- 图片转 PDF 操作手册：[docs/tools/image-to-pdf/operation-manual.md](./docs/tools/image-to-pdf/operation-manual.md)

## 目录约定

```text
src/app/                     应用壳和全局样式
src/tools/                   工具注册表和工具模块
src/tools/text-toolbox/      第一个工具模块
src/tools/image-to-pdf/      图片转 PDF 工具
docs/tools/                  每个工具的操作手册
```

## 后续扩展约定

- 新工具继续加到这个主应用里，而不是新建独立仓库
- 每个工具都要在 `src/tools/` 下注册
- 每个工具都要同步补操作手册
