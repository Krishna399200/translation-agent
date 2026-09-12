export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy env.example to .env.local, fill in your Supabase project's URL and anon key " +
        "(Settings → API in the Supabase dashboard), then restart `npm run dev` " +
        "— Next.js only reads .env.local at server startup."
    );
  }

  return { url, anonKey };
}
