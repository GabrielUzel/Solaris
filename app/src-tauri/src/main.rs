#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_shell::ShellExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Falha ao encontrar diretório de dados");

            if !app_data_dir.exists() {
                std::fs::create_dir_all(&app_data_dir).expect("Falha ao criar diretório de dados");
            }

            let db_path = app_data_dir.join("solaris_core_dev.db");
            let db_path_str = db_path.to_str().unwrap().to_string();

            let sidecar_command = app
                .shell()
                .sidecar("solaris_core")
                .unwrap()
                .env("DATABASE_PATH", db_path_str)
                .env("PORT", "4000")
                .env("PHX_SERVER", "true");

            let (_rx, _child) = sidecar_command
                .spawn()
                .expect("Falha ao iniciar backend Phoenix");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
