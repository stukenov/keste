#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cmds;
mod sqlite_reader;
mod sqlite_writer;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmds::choose_open_file,
            cmds::choose_save_file,
            cmds::get_auto_save_path,
            cmds::save_sqlite,
            cmds::read_sqlite
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
