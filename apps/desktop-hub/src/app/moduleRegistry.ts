import { BookOpen, Calculator, Gamepad2, Image, Wrench } from 'lucide-react';
import type { ComponentType } from 'react';

export type ModuleCategory = 'learning' | 'entertainment' | 'tools';
export type ModuleDefinition = { id: string; title: string; description: string; category: ModuleCategory; icon: ComponentType<{ size?: number }>; color: string; status: 'ready' | 'planned'; };

export const moduleRegistry: ModuleDefinition[] = [
  { id: 'knowledge', title: '知识空间', description: '整理、连接和复习你的知识', category: 'learning', icon: BookOpen, color: 'violet', status: 'ready' },
  { id: 'image-lab', title: '图像工作室', description: '轻量编辑、转换与素材处理', category: 'tools', icon: Image, color: 'cyan', status: 'ready' },
  { id: 'calculator', title: '计算工具', description: '快速完成日常计算与换算', category: 'tools', icon: Calculator, color: 'orange', status: 'ready' },
  { id: 'playground', title: '灵感乐园', description: '小游戏、实验和放松时刻', category: 'entertainment', icon: Gamepad2, color: 'pink', status: 'planned' },
  { id: 'toolbox', title: '更多工具', description: '持续接入你的高频工作流', category: 'tools', icon: Wrench, color: 'green', status: 'planned' },
];
