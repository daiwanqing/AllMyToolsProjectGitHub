import type { ComponentType } from 'react';
import { ToolRegistry, type ToolSession } from '@allmytools/platform-services';
import { manifest as noteReviewManifest } from '@allmytools/learning-note-review/manifest';
import { manifest as sessionPickerManifest } from '@allmytools/entertainment-session-picker/manifest';
import { manifest as textWorkbenchManifest } from '@allmytools/tools-text-workbench/manifest';

export type LoadedToolModule = Readonly<{
  ToolView: ComponentType;
}>;

export type ActiveToolSession = ToolSession<LoadedToolModule>;

export const toolRegistry = new ToolRegistry<LoadedToolModule>('0.1.0');

toolRegistry.register({
  manifest: noteReviewManifest,
  load: () => import('@allmytools/learning-note-review'),
});

toolRegistry.register({
  manifest: sessionPickerManifest,
  load: () => import('@allmytools/entertainment-session-picker'),
});

toolRegistry.register({
  manifest: textWorkbenchManifest,
  load: () => import('@allmytools/tools-text-workbench'),
});
