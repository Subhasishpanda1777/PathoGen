/**
 * Export All Database Tables to Excel
 * 
 * This script exports all database tables to individual Excel files:
 * - Each table gets its own Excel file
 * - All column headers included
 * - All data rows included
 */

import postgres from "postgres";
import * as XLSX from "xlsx";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, existsSync } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database connection
function getConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = process.env.DB_PORT || "5432";
  const dbName = process.env.DB_NAME || "pathogen";
  const dbUser = process.env.DB_USER || "postgres";
  const dbPassword = process.env.DB_PASSWORD || "";
  
  if (!dbPassword) {
    throw new Error(
      "DB_PASSWORD environment variable is required for local database connection"
    );
  }
  
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

async function getAllTableNames(client) {
  const result = await client`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  return result.map(row => row.table_name);
}

async function getTableColumns(client, tableName) {
  const result = await client`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = ${tableName}
    ORDER BY ordinal_position;
  `;
  return result.map(row => row.column_name);
}

async function getTableData(client, tableName) {
  try {
    // Get all data from table (using limit to prevent memory issues on very large tables)
    const result = await client.unsafe(`SELECT * FROM "${tableName}" LIMIT 50000;`);
    return result;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error.message);
    return [];
  }
}

async function exportTableToExcel(client, tableName, outputDir) {
  try {
    console.log(`\n📝 Processing table: ${tableName}...`);
    
    // Get column names
    const columns = await getTableColumns(client, tableName);
    console.log(`   Columns: ${columns.length}`);
    
    // Get table data
    const data = await getTableData(client, tableName);
    console.log(`   Rows: ${data.length}`);
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to array of arrays format
    // First row: column headers
    const rows = [columns];
    
    // Add data rows if table has data
    if (data.length > 0) {
      data.forEach(row => {
        const values = columns.map(col => {
          const value = row[col];
          
          // Handle different data types
          if (value === null || value === undefined) {
            return "";
          }
          
          let stringValue;
          
          // Handle JSON/JSONB columns
          if (typeof value === "object" && !(value instanceof Date)) {
            stringValue = JSON.stringify(value);
          }
          // Handle dates
          else if (value instanceof Date) {
            stringValue = value.toISOString();
          }
          // Handle other types - convert to string
          else {
            stringValue = String(value);
          }
          
          // Excel cell limit is 32,767 characters - truncate if needed
          const MAX_CELL_LENGTH = 32767;
          if (stringValue.length > MAX_CELL_LENGTH) {
            return stringValue.substring(0, MAX_CELL_LENGTH - 3) + "...";
          }
          
          return stringValue;
        });
        rows.push(values);
      });
    }
    
    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    
    // Auto-size columns (approximate)
    const maxWidth = 50;
    const colWidths = columns.map((col, idx) => {
      let maxLen = col.length;
      rows.slice(1).forEach(row => {
        const cellValue = row[idx]?.toString() || "";
        if (cellValue.length > maxLen) {
          maxLen = Math.min(cellValue.length, maxWidth);
        }
      });
      return { wch: Math.min(maxLen + 2, maxWidth) };
    });
    worksheet["!cols"] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
    
    // Generate filename
    const filename = `${tableName}.xlsx`;
    const filepath = join(outputDir, filename);
    
    // Write workbook to file
    XLSX.writeFile(workbook, filepath);
    
    console.log(`   ✅ Exported to: ${filename} (${data.length} rows)`);
    
    return {
      tableName,
      filename,
      rows: data.length,
      columns: columns.length,
      filepath
    };
  } catch (error) {
    console.error(`   ❌ Error processing table ${tableName}:`, error.message);
    throw error;
  }
}

async function exportAllTablesToExcel() {
  const connectionString = getConnectionString();
  const client = postgres(connectionString, { prepare: false });
  
  try {
    console.log("📊 Connecting to database...");
    console.log("📋 Getting list of tables...");
    
    const tableNames = await getAllTableNames(client);
    console.log(`Found ${tableNames.length} tables: ${tableNames.join(", ")}`);
    
    // Create output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const outputDir = join(__dirname, "..", "..", "..", `database-exports-${timestamp}`);
    
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
      console.log(`\n📁 Created output directory: database-exports-${timestamp}`);
    }
    
    const results = [];
    let totalRows = 0;
    
    // Process each table
    for (const tableName of tableNames) {
      try {
        const result = await exportTableToExcel(client, tableName, outputDir);
        results.push(result);
        totalRows += result.rows;
      } catch (error) {
        console.error(`Failed to export ${tableName}:`, error.message);
      }
    }
    
    // Create summary file
    const summaryData = [
      ["Table Name", "Filename", "Rows", "Columns", "Status"],
      ...results.map(r => [r.tableName, r.filename, r.rows, r.columns, "✅ Exported"])
    ];
    
    const summaryWorkbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(summaryWorkbook, summarySheet, "Summary");
    XLSX.writeFile(summaryWorkbook, join(outputDir, "_EXPORT_SUMMARY.xlsx"));
    
    console.log(`\n✅ Export complete!`);
    console.log(`📁 Files saved to: ${outputDir}`);
    console.log(`📊 Total tables: ${results.length}`);
    console.log(`📝 Total rows exported: ${totalRows}`);
    console.log(`\n📋 Files created:`);
    results.forEach(r => {
      console.log(`   • ${r.filename} (${r.rows} rows)`);
    });
    console.log(`   • _EXPORT_SUMMARY.xlsx`);
    
    return {
      outputDir,
      totalTables: results.length,
      totalRows,
      files: results.map(r => r.filename)
    };
    
  } catch (error) {
    console.error("❌ Error exporting tables:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the export
exportAllTablesToExcel()
  .then((result) => {
    console.log(`\n✨ Done! All ${result.totalTables} tables exported to separate Excel files.`);
    console.log(`📂 Location: ${result.outputDir}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Export failed:", error);
    process.exit(1);
  });
