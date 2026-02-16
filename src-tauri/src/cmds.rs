use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::api::{
    dialog::blocking::FileDialogBuilder,
    path::{cache_dir, data_dir},
};

#[derive(Serialize)]
pub struct SaveResult {
    bytes_written: usize,
}

#[derive(Deserialize)]
pub struct ReadSqliteRequest {
    file_path: String,
}

#[tauri::command]
pub fn choose_open_file() -> Result<String, String> {
    FileDialogBuilder::new()
        .add_filter("Spreadsheet Files", &["xlsx", "kst"])
        .add_filter("Excel Files", &["xlsx"])
        .add_filter("Keste Files", &["kst"])
        .pick_file()
        .map(|path| path.to_string_lossy().to_string())
        .ok_or_else(|| "No file selected".to_string())
}

#[tauri::command]
pub fn choose_save_file(default_name: String) -> Result<String, String> {
    FileDialogBuilder::new()
        .set_file_name(&default_name)
        .add_filter("Keste Spreadsheet", &["kst"])
        .save_file()
        .map(|path| path.to_string_lossy().to_string())
        .ok_or_else(|| "No file selected".to_string())
}

#[tauri::command]
pub fn get_auto_save_path() -> Result<String, String> {
    let mut base_dir: PathBuf = cache_dir()
        .or_else(data_dir)
        .unwrap_or_else(std::env::temp_dir);

    base_dir.push("Keste");
    base_dir.push("AutoSave");

    fs::create_dir_all(&base_dir)
        .map_err(|e| format!("Failed to create auto-save directory: {}", e))?;

    base_dir.push("autosave.kst");

    Ok(base_dir.to_string_lossy().to_string())
}

#[derive(Deserialize)]
pub struct SaveSqliteRequest {
    sql_dump: String,
    out_path: String,
}

#[tauri::command]
pub fn save_sqlite(request: SaveSqliteRequest) -> Result<SaveResult, String> {
    crate::sqlite_writer::write_sqlite(&request.sql_dump, &request.out_path)
        .map(|bytes| SaveResult {
            bytes_written: bytes,
        })
        .map_err(|e| format!("SQLite write error: {}", e))
}

#[tauri::command]
pub fn read_sqlite(request: ReadSqliteRequest) -> Result<String, String> {
    crate::sqlite_reader::read_sqlite(&request.file_path)
        .map_err(|e| format!("SQLite read error: {}", e))
}
