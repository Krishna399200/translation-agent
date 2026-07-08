"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Settings = {
  tone432: boolean;
  noPressureMode: boolean;
};

type SettingsContextValue = Settings & {
  setTone432: (value: boolean) => void;
  setNoPressureMode: (value: boolean) => void;
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

  const persist = useCallback(
    async (patch: Partial<{ tone_432hz_enabled: boolean; no_pressure_mode: boolean }>) => {
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

  return (
    <SettingsContext.Provider value={{ tone432, noPressureMode, setTone432, setNoPressureMode }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
