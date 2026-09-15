#[cfg(desktop)]
use tauri::{
    menu::MenuBuilder,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WindowEvent,
};

#[cfg(desktop)]
const MAIN_WINDOW_LABEL: &str = "main";

#[cfg(desktop)]
fn show_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return;
    };

    let _ = window.show();
    let _ = window.set_focus();
}

#[cfg(desktop)]
fn toggle_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return;
    };

    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
    } else {
        show_main_window(app);
    }
}

#[cfg(desktop)]
fn configure_desktop(app: &mut tauri::App) -> tauri::Result<()> {
    let show_item = "tray-show";
    let hide_item = "tray-hide";
    let quit_item = "tray-quit";
    let menu = MenuBuilder::new(app)
        .text(show_item, "显示主窗口")
        .text(hide_item, "隐藏主窗口")
        .separator()
        .text(quit_item, "退出 AllMyTools")
        .build()?;

    TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .tooltip("AllMyTools")
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| {
            if event.id() == show_item {
                show_main_window(app);
            } else if event.id() == hide_item {
                if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
                    let _ = window.hide();
                }
            } else if event.id() == quit_item {
                app.exit(0);
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_main_window(tray.app_handle());
            }
        })
        .icon(
            app.default_window_icon()
                .cloned()
                .expect("missing application icon"),
        )
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build());

    builder
        .setup(|app| {
            #[cfg(desktop)]
            configure_desktop(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            #[cfg(desktop)]
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("启动 AllMyTools 桌面应用时发生不可恢复错误");
}
