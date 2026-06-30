import type { ComponentType } from 'react';

export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  route: string;
  defaultPath?: string;
  component: ComponentType;
};
