import * as XLSX from "xlsx";

/**
 * Reads an Excel file and returns an array of objects, one per row.
 * @param filePath Path to the .xlsx file
 */
export function excelToJson(filePath: string): Record<string, unknown>[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}
