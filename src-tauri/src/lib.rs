#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
