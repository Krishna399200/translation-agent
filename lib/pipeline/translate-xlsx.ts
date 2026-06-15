/**
 * STEP 4 — The Excel translation pipeline
 *
 * This ties together extract → translate → rebuild.
 * The API route calls this single function.
 */
import { extractTextFromXlsx } from "@/lib/extract/xlsx";
import { applyTranslationsToWorkbook, workbookToBuffer } from "@/lib/rebuild/xlsx";
import { translateMany } from "@/lib/translate";

export async function translateXlsxFile(
  fileBuffer: ArrayBuffer,
  targetLanguage: string
): Promise<Buffer> {
  const { workbook, cells } = await extractTextFromXlsx(fileBuffer);

  if (cells.length === 0) {
    throw new Error("No translatable text found in this Excel file.");
  }

  const originalTexts = cells.map((c) => c.text);
  const translatedTexts = await translateMany(originalTexts, targetLanguage);

  applyTranslationsToWorkbook(workbook, cells, translatedTexts);

  return workbookToBuffer(workbook);
}
