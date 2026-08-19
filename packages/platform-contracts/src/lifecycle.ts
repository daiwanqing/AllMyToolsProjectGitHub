import type { ToolLifecycleState, ToolLifecycleTransition } from './types';

const allowedTargets: Readonly<Record<ToolLifecycleState, readonly ToolLifecycleState[]>> = {
  registered: ['capability-checked', 'disposed'],
  'capability-checked': ['loaded', 'disposed'],
  loaded: ['active', 'disposed'],
  active: ['suspended', 'disposed'],
  suspended: ['active', 'disposed'],
  disposed: [],
};

/** 只允许文档定义的正常推进、恢复和任意阶段的资源释放。 */
export function canTransitionToolLifecycle(transition: ToolLifecycleTransition): boolean {
  return allowedTargets[transition.from].includes(transition.to);
}
