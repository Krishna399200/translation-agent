export type PracticeType = "reading_text" | "mantra" | "varnamala" | "trigger_words" | "journal";

export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          baseline_confidence: number | null;
          created_at: string;
          tone_432hz_enabled: boolean;
          no_pressure_mode: boolean;
          last_journal_prompt_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          baseline_confidence?: number | null;
          created_at?: string;
          tone_432hz_enabled?: boolean;
          no_pressure_mode?: boolean;
          last_journal_prompt_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          baseline_confidence?: number | null;
          created_at?: string;
          tone_432hz_enabled?: boolean;
          no_pressure_mode?: boolean;
          last_journal_prompt_at?: string | null;
        };
        Relationships: [];
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          phrase_id: string;
          audio_url: string;
          duration_seconds: number;
          self_rating: number | null;
          baseline_confidence: number | null;
          practice_type: PracticeType;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          phrase_id: string;
          audio_url: string;
          duration_seconds: number;
          self_rating?: number | null;
          baseline_confidence?: number | null;
          practice_type?: PracticeType;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          phrase_id?: string;
          audio_url?: string;
          duration_seconds?: number;
          self_rating?: number | null;
          baseline_confidence?: number | null;
          practice_type?: PracticeType;
        };
        Relationships: [];
      };
      text_bank: {
        Row: {
          id: string;
          content: string;
          pace_tag: string;
          length_tag: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          pace_tag: string;
          length_tag: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          pace_tag?: string;
          length_tag?: string;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      trigger_words: {
        Row: {
          id: string;
          word: string;
          category: string;
          phrase_level_1: string;
          phrase_level_2: string;
          phrase_level_3: string;
        };
        Insert: {
          id?: string;
          word: string;
          category: string;
          phrase_level_1: string;
          phrase_level_2: string;
          phrase_level_3: string;
        };
        Update: {
          id?: string;
          word?: string;
          category?: string;
          phrase_level_1?: string;
          phrase_level_2?: string;
          phrase_level_3?: string;
        };
        Relationships: [];
      };
      user_trigger_words: {
        Row: {
          id: string;
          user_id: string;
          word: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word?: string;
          added_at?: string;
        };
        Relationships: [];
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PracticeSession = Database["public"]["Tables"]["practice_sessions"]["Row"];
export type TextBankEntry = Database["public"]["Tables"]["text_bank"]["Row"];
export type TriggerWord = Database["public"]["Tables"]["trigger_words"]["Row"];
export type UserTriggerWord = Database["public"]["Tables"]["user_trigger_words"]["Row"];
