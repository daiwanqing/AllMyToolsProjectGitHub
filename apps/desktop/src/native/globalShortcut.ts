import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';

export const quickToggleShortcut = 'CommandOrControl+Shift+Space';

export function supportsGlobalShortcuts() {
  return isTauri();
}

export async function enableQuickToggleShortcut() {
  await register(quickToggleShortcut, async (event) => {
    if (event.state !== 'Pressed') {
      return;
    }

    const currentWindow = getCurrentWebviewWindow();
    if (await currentWindow.isVisible()) {
      await currentWindow.hide();
      return;
    }

    await currentWindow.show();
    await currentWindow.setFocus();
  });
}

export function disableQuickToggleShortcut() {
  return unregister(quickToggleShortcut);
}
