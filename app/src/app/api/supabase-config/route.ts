import { NextResponse } from 'next/server'

export async function GET() {
  // Supabase anon key is safe to expose to the client
  return NextResponse.json({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  })
}
