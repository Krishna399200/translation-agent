"use client";

import { useTone432 } from "@/lib/useTone432";
import { useSettings } from "@/lib/settings/SettingsContext";

/** Mounted once at the app root so the 432Hz tone plays across every mode, not just one screen — ducking out only for the settings toggle or an active recording. */
export default function AmbientTone() {
  const { tone432, recordingActive } = useSettings();
  useTone432(tone432 && !recordingActive);
  return null;
}
