import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type WishRow = {
  id: string;
  author: string;
  message: string;
  flower_id: string;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      wishes: {
        Row: WishRow;
        Insert: {
          id?: string;
          author: string;
          message: string;
          flower_id: string;
          created_at?: string;
        };
        Update: Partial<WishRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseClient: SupabaseClient<Database> | undefined;

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Hãy tạo .env.local theo .env.example.",
    );
  }

  supabaseClient ??= createClient<Database>(url, publishableKey);
  return supabaseClient;
}
