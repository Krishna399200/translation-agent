/**
 * STEP 3b — Write translated text back into Excel
 *
 * We keep the original workbook (styles, column widths, etc.)
 * and only replace the text in cells we translated.
 */
import ExcelJS from "exceljs";
import type { ExcelCellText } from "@/lib/extract/xlsx";

/** Apply translated strings to their original cell locations. */
export function applyTranslationsToWorkbook(
  workbook: ExcelJS.Workbook,
  cells: ExcelCellText[],
  translatedTexts: string[]
): void {
  if (cells.length !== translatedTexts.length) {
    throw new Error("Cell count and translation count do not match.");
  }

  cells.forEach((cellInfo, index) => {
    const sheet = workbook.getWorksheet(cellInfo.sheetName);
    if (!sheet) return;

    const cell = sheet.getCell(cellInfo.row, cellInfo.col);
    cell.value = translatedTexts[index];
  });
}

/** Save the workbook to a Buffer the browser can download. */
export async function workbookToBuffer(
  workbook: ExcelJS.Workbook
): Promise<Buffer> {
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
