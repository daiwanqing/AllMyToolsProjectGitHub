import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';

export const quickToggleShortcut = 'CommandOrControl+Shift+Space';
export const defaultDebugShortcut = 'CommandOrControl+Alt+0';
export const debugShortcutEventName = 'allmytools:debug-toggle';

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

/** 注册调试模式快捷键；回调通过受控事件交给桌面壳处理。 */
export async function enableDebugShortcut(shortcut: string) {
  await register(shortcut, (event) => {
    if (event.state === 'Pressed') {
      window.dispatchEvent(new CustomEvent(debugShortcutEventName));
    }
  });
}

export function disableDebugShortcut(shortcut: string) {
  return unregister(shortcut);
}
