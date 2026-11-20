import { supabase } from '@/lib/supabaseClient'

export const instant = false

export default async function Home() {
  const { data: notes, error } = await supabase.from('notes').select()

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>scout-pal</h1>
      <h2>Notes from the database:</h2>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      <ul>
        {notes?.map((note) => (
          <li key={note.id}>{note.content}</li>
        ))}
      </ul>
    </main>
  )
}