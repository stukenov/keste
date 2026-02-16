use rusqlite::{Connection, Result};
use std::fs;
use std::path::Path;

pub fn write_sqlite(sql_dump: &str, out_path: &str) -> Result<usize, Box<dyn std::error::Error>> {
    let out_path = Path::new(out_path);

    if let Some(parent) = out_path.parent() {
        fs::create_dir_all(parent)?;
    }

    // Create temporary file for atomic write
    let temp_path = out_path.with_extension("kst.tmp");

    // Remove temp file if exists
    let _ = fs::remove_file(&temp_path);

    // Create new database
    let conn = Connection::open(&temp_path)?;

    // Execute SQL dump
    conn.execute_batch(sql_dump)?;

    // Get file size
    let metadata = fs::metadata(&temp_path)?;
    let bytes_written = metadata.len() as usize;

    // Close connection explicitly
    drop(conn);

    // Atomic rename
    let _ = fs::remove_file(out_path);
    fs::rename(&temp_path, out_path)?;

    Ok(bytes_written)
}
