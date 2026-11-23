import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  const { content } = await request.json()
  if (!content) {
    return NextResponse.json({ error: 'No content provided' }, { status: 400 })
  }

  // 1. turn the text into an embedding (a meaning-vector)
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
  })
  const embedding = embeddingResponse.data[0].embedding

  // 2. store the text + its embedding on the shelf
  const { error } = await supabase.from('documents').insert({ content, embedding })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}