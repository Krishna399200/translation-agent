/**
 * STEP 5 — API route (backend)
 *
 * URL: POST /api/translate
 * Body: multipart form with "file" and "language"
 *
 * This runs on the server only — your Gemini API key never reaches the browser.
 */
import { translateXlsxFile } from "@/lib/pipeline/translate-xlsx";
import { isQuotaError, quotaErrorMessage } from "@/lib/translate";
import {
  getOrCreateVisitorId,
  isLimitExceeded,
  LIMIT_EXCEEDED_MESSAGE,
  recordTranslation,
  TRANSLATION_LIMIT,
} from "@/lib/usage-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPPORTED_EXTENSIONS = [".xlsx"];

export async function POST(request: Request) {
  try {
    const visitorId = await getOrCreateVisitorId();

    if (await isLimitExceeded(visitorId)) {
      return NextResponse.json(
        {
          error: LIMIT_EXCEEDED_MESSAGE,
          used: TRANSLATION_LIMIT,
          remaining: 0,
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const language = formData.get("language");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (typeof language !== "string" || !language.trim()) {
      return NextResponse.json(
        { error: "Please select a target language." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const isSupported = SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!isSupported) {
      return NextResponse.json(
        {
          error:
            "Only .xlsx files are supported in Step 1. Word and PDF come in later steps.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const outputBuffer = await translateXlsxFile(arrayBuffer, language.trim());

    const usage = await recordTranslation(visitorId);

    const baseName = file.name.replace(/\.xlsx$/i, "");
    const outputName = `${baseName}_${language.trim()}.xlsx`;

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "X-Translations-Used": String(usage.used),
        "X-Translations-Remaining": String(usage.remaining),
      },
    });
  } catch (error) {
    if (isQuotaError(error)) {
      return NextResponse.json({ error: quotaErrorMessage() }, { status: 429 });
    }
    const message =
      error instanceof Error ? error.message : "Translation failed.";
    console.error("[translate]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
