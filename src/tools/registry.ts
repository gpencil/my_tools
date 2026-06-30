import type { ToolDefinition } from './types';
import { ImageToPdfTool } from './image-to-pdf/ImageToPdfTool';
import { TextToolboxTool } from './text-toolbox/TextToolboxTool';

export const toolRegistry: ToolDefinition[] = [
  {
    id: 'text-toolbox',
    name: '文本工具箱',
    description: '把 JSON 格式化和按行文本比对收在一个本地工具里。',
    route: '/tools/text-toolbox',
    defaultPath: '/tools/text-toolbox/json',
    component: TextToolboxTool
  },
  {
    id: 'image-to-pdf',
    name: '图片转 PDF',
    description: '把本地图片按选择顺序合并成一个 PDF。',
    route: '/tools/image-to-pdf',
    component: ImageToPdfTool
  }
];
