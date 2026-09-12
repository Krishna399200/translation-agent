"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Settings = {
  tone432: boolean;
  noPressureMode: boolean;
  mentorFeedbackEnabled: boolean;
  mentorVoiceEnabled: boolean;
};

type SettingsContextValue = Settings & {
  setTone432: (value: boolean) => void;
  setNoPressureMode: (value: boolean) => void;
  setMentorFeedbackEnabled: (value: boolean) => void;
  setMentorVoiceEnabled: (value: boolean) => void;
  /** Ephemeral, not persisted — true whenever any recorder on the current page is capturing audio, so the ambient 432Hz tone can duck out of the way instead of bleeding into the recording. */
  recordingActive: boolean;
  setRecordingActive: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  userId,
  initial,
  children,
}: {
  userId: string;
  initial: Settings;
  children: React.ReactNode;
}) {
  const [tone432, setTone432State] = useState(initial.tone432);
  const [noPressureMode, setNoPressureModeState] = useState(initial.noPressureMode);
  const [mentorFeedbackEnabled, setMentorFeedbackEnabledState] = useState(initial.mentorFeedbackEnabled);
  const [mentorVoiceEnabled, setMentorVoiceEnabledState] = useState(initial.mentorVoiceEnabled);
  const [recordingActive, setRecordingActive] = useState(false);

  const persist = useCallback(
    async (
      patch: Partial<{
        tone_432hz_enabled: boolean;
        no_pressure_mode: boolean;
        mentor_feedback_enabled: boolean;
        mentor_voice_enabled: boolean;
      }>
    ) => {
      const supabase = createClient();
      await supabase.from("profiles").update(patch).eq("id", userId);
    },
    [userId]
  );

  const setTone432 = useCallback(
    (value: boolean) => {
      setTone432State(value);
      persist({ tone_432hz_enabled: value });
    },
    [persist]
  );

  const setNoPressureMode = useCallback(
    (value: boolean) => {
      setNoPressureModeState(value);
      persist({ no_pressure_mode: value });
    },
    [persist]
  );

  const setMentorFeedbackEnabled = useCallback(
    (value: boolean) => {
      setMentorFeedbackEnabledState(value);
      persist({ mentor_feedback_enabled: value });
    },
    [persist]
  );

  const setMentorVoiceEnabled = useCallback(
    (value: boolean) => {
      setMentorVoiceEnabledState(value);
      persist({ mentor_voice_enabled: value });
    },
    [persist]
  );

  return (
    <SettingsContext.Provider
      value={{
        tone432,
        noPressureMode,
        mentorFeedbackEnabled,
        mentorVoiceEnabled,
        recordingActive,
        setTone432,
        setNoPressureMode,
        setMentorFeedbackEnabled,
        setMentorVoiceEnabled,
        setRecordingActive,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
