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
        };
        Insert: {
          id: string;
          name: string;
          baseline_confidence?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          baseline_confidence?: number | null;
          created_at?: string;
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
          self_rating: number;
          baseline_confidence: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          phrase_id: string;
          audio_url: string;
          duration_seconds: number;
          self_rating: number;
          baseline_confidence?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          phrase_id?: string;
          audio_url?: string;
          duration_seconds?: number;
          self_rating?: number;
          baseline_confidence?: number | null;
        };
        Relationships: [];
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PracticeSession = Database["public"]["Tables"]["practice_sessions"]["Row"];
