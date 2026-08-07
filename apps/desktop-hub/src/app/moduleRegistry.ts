import { BookOpen, Calculator, Gamepad2, Image, Wrench } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export type ModuleCategory = 'learning' | 'entertainment' | 'tools';
export type ModuleDefinition = { id: string; title: string; description: string; category: ModuleCategory; icon: ComponentType<LucideProps>; color: string; status: 'ready' | 'planned' };

export const moduleRegistry: ModuleDefinition[] = [
  { id: 'knowledge', title: '\u77e5\u8bc6\u7a7a\u95f4', description: '\u6574\u7406\u3001\u8fde\u63a5\u548c\u590d\u4e60\u4f60\u7684\u77e5\u8bc6', category: 'learning', icon: BookOpen, color: 'violet', status: 'ready' },
  { id: 'image-lab', title: '\u56fe\u50cf\u5de5\u4f5c\u5ba4', description: '\u8f7b\u91cf\u7f16\u8f91\u3001\u8f6c\u6362\u4e0e\u7d20\u6750\u5904\u7406', category: 'tools', icon: Image, color: 'cyan', status: 'ready' },
  { id: 'calculator', title: '\u8ba1\u7b97\u5de5\u5177', description: '\u5feb\u901f\u5b8c\u6210\u65e5\u5e38\u8ba1\u7b97\u4e0e\u6362\u7b97', category: 'tools', icon: Calculator, color: 'orange', status: 'ready' },
  { id: 'playground', title: '\u7075\u611f\u4e50\u56ed', description: '\u5c0f\u6e38\u620f\u3001\u5b9e\u9a8c\u548c\u653e\u677e\u65f6\u523b', category: 'entertainment', icon: Gamepad2, color: 'pink', status: 'planned' },
  { id: 'toolbox', title: '\u66f4\u591a\u5de5\u5177', description: '\u6301\u7eed\u63a5\u5165\u4f60\u7684\u9ad8\u9891\u5de5\u4f5c\u6d41', category: 'tools', icon: Wrench, color: 'green', status: 'planned' },
];
