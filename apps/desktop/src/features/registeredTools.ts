import type { ComponentType } from 'react';
import { ToolRegistry, type ToolSession } from '@allmytools/platform-services';
import { manifest as noteReviewManifest } from '@allmytools/learning-note-review/manifest';
import { manifest as sessionPickerManifest } from '@allmytools/entertainment-session-picker/manifest';
import { manifest as calendarTodosManifest } from '@allmytools/tools-calendar-todos/manifest';
import { manifest as travelNotesManifest } from '@allmytools/tools-travel-notes/manifest';
import { manifest as boardGamesManifest } from '@allmytools/life-board-games/manifest';

export type LoadedToolModule = Readonly<{
  ToolView: ComponentType<{ onClose?: () => void }>;
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
  manifest: calendarTodosManifest,
  load: () => import('@allmytools/tools-calendar-todos'),
});

toolRegistry.register({
  manifest: travelNotesManifest,
  load: () => import('@allmytools/tools-travel-notes'),
});

toolRegistry.register({
  manifest: boardGamesManifest,
  load: () => import('@allmytools/life-board-games'),
});
