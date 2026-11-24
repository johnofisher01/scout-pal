import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  const { question } = await request.json()
  if (!question) {
    return NextResponse.json({ error: 'No question provided' }, { status: 400 })
  }

  // 1. embed the question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding

  // 2. find the nearest submissions on the shelf
  const { data: documents, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 5,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 3. build the context from what we retrieved
  const context = (documents ?? []).map((d: { content: string }) => d.content).join('\n\n')

  // 4. ask the LLM, grounded in that context
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You answer questions about what people submitted. Use ONLY the context provided. If the answer is not in it, say you do not have enough submissions to answer yet.' },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
    ],
  })

  return NextResponse.json({ answer: completion.choices[0].message.content })
}