import { supabase } from '../../lib/supabaseClient'

export default async function Home() {
  const { data } = await supabase.from('test').select('*').limit(1)

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Supabase connected</h1>
      <pre>{JSON.stringify(    data, null, 2)}</pre>
    </main>
  )
}
