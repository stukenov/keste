use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CellData {
    pub row: i64,
    pub col: i64,
    #[serde(rename = "type")]
    pub cell_type: String,
    pub value: Option<String>,
    pub formula: Option<String>,
    pub style_id: Option<i64>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SheetData {
    pub id: String,
    pub name: String,
    #[serde(rename = "sheetId")]
    pub sheet_id: i64,
    pub cells: Vec<CellData>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkbookData {
    pub id: String,
    pub sheets: Vec<SheetData>,
}

pub fn read_sqlite(file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let conn = Connection::open(file_path)?;

    // Read workbook metadata
    let workbook_id: String = conn
        .query_row("SELECT id FROM workbook LIMIT 1", [], |row| row.get(0))
        .unwrap_or_else(|_| "workbook-1".to_string());

    // Read all sheets
    let mut sheet_stmt =
        conn.prepare("SELECT id, name, sheet_order FROM sheet ORDER BY sheet_order")?;
    let sheets_iter = sheet_stmt.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
        ))
    })?;

    let mut sheets = Vec::new();

    for sheet_result in sheets_iter {
        let (sheet_id, sheet_name, sheet_order) = sheet_result?;

        // Read cells for this sheet
        let mut cell_stmt = conn.prepare(
            "SELECT row, col, type, value, formula, style_id 
             FROM cell 
             WHERE sheet_id = ?1 
             ORDER BY row, col",
        )?;

        let cells_iter = cell_stmt.query_map([&sheet_id], |row| {
            Ok(CellData {
                row: row.get(0)?,
                col: row.get(1)?,
                cell_type: row.get(2)?,
                value: row.get(3)?,
                formula: row.get(4)?,
                style_id: row.get(5)?,
            })
        })?;

        let mut cells = Vec::new();
        for cell_result in cells_iter {
            cells.push(cell_result?);
        }

        sheets.push(SheetData {
            id: sheet_id,
            name: sheet_name,
            sheet_id: sheet_order,
            cells,
        });
    }

    let workbook = WorkbookData {
        id: workbook_id,
        sheets,
    };

    // Convert to JSON
    let json = serde_json::to_string(&workbook)?;
    Ok(json)
}
