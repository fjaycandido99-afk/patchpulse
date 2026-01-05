import Link from 'next/link'
import { Gamepad2, Home, ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

async function getGame(gameId: string) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('games')
      .select('id, name, cover_url')
      .eq('id', gameId)
      .single()

    if (error) {
      console.error('Error fetching game:', error)
      return null
    }
    return data
  } catch (e) {
    console.error('Exception fetching game:', e)
    return null
  }
}

export default async function BacklogDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  const game = await getGame(gameId)

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <Gamepad2 className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          This game may have been removed or doesn't exist.
        </p>
        <div className="flex gap-3">
          <Link href="/backlog" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <Link href="/home" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted font-medium">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{game.name}</h1>
      <p className="text-muted-foreground mt-2">Game ID: {game.id}</p>
      {game.cover_url && (
        <img src={game.cover_url} alt={game.name} className="mt-4 w-32 rounded-lg" />
      )}
      <Link href="/backlog" className="mt-6 inline-block text-primary">
        ← Back to Library
      </Link>
    </div>
  )
}
