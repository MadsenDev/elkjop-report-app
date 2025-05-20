#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        // Logging plugin
        .plugin(tauri_plugin_log::Builder::default().build())
        
        .setup(|app| {
            log::info!("Setting up Tauri application…");

            // Grab the main window created in tauri.conf.json
            let window = app.get_webview_window("main").unwrap();
            log::info!("Got main window, title: {}", window.title().unwrap());

            #[cfg(debug_assertions)]
            {
                log::info!("Opening dev tools…");
                window.open_devtools();
            }

            // Add window event listeners
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                log::debug!("Window event: {:?}", event);
                match event {
                    tauri::WindowEvent::CloseRequested { .. } => {
                        log::info!("Window close requested");
                    }
                    tauri::WindowEvent::Resized { .. } => {
                        log::debug!("Window resized");
                    }
                    tauri::WindowEvent::Moved { .. } => {
                        log::debug!("Window moved");
                    }
                    _ => {}
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}