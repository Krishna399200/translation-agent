/**
 * STEP 3a — Extract text from Excel
 *
 * We walk every sheet, row, and cell. Only plain text cells with letters
 * are collected (numbers and formulas are skipped for now).
 */
import ExcelJS from "exceljs";

/** One cell that contains translatable text. */
export type ExcelCellText = {
  sheetName: string;
  row: number;
  col: number;
  text: string;
};

function cellHasTranslatableText(value: ExcelJS.CellValue): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  // Skip empty cells and cells that are only numbers/symbols
  return trimmed.length > 0 && /[a-zA-Z\u00C0-\u024F\u0400-\u04FF\u4E00-\u9FFF]/.test(trimmed);
}

/** Read an .xlsx file buffer and return all text cells. */
export async function extractTextFromXlsx(
  fileBuffer: ArrayBuffer
): Promise<{ workbook: ExcelJS.Workbook; cells: ExcelCellText[] }> {
  const workbook = new ExcelJS.Workbook();
  // exceljs typings expect a legacy Buffer shape; ArrayBuffer works at runtime.
  await workbook.xlsx.load(fileBuffer as unknown as ExcelJS.Buffer);

  const cells: ExcelCellText[] = [];

  workbook.eachSheet((sheet) => {
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        // Skip formulas — translating "=SUM(A1:A5)" would break the sheet
        if (cell.type === ExcelJS.ValueType.Formula) return;

        const value = cell.value;
        if (typeof value === "object" && value !== null && "richText" in value) {
          const richText = (value as ExcelJS.CellRichTextValue).richText
            .map((part) => part.text)
            .join("");
          if (cellHasTranslatableText(richText)) {
            cells.push({
              sheetName: sheet.name,
              row: rowNumber,
              col: colNumber,
              text: richText.trim(),
            });
          }
          return;
        }

        if (cellHasTranslatableText(value as ExcelJS.CellValue)) {
          cells.push({
            sheetName: sheet.name,
            row: rowNumber,
            col: colNumber,
            text: (value as string).trim(),
          });
        }
      });
    });
  });

  return { workbook, cells };
}
