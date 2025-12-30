'use server'

import { getPatchesList } from '../patches/queries'

export async function loadMorePatches(params: {
  gameId?: string
  tag?: string
  importance?: 'major' | 'medium' | 'minor'
  followedOnly?: boolean
  page: number
}) {
  const result = await getPatchesList({
    gameId: params.gameId,
    tag: params.tag,
    importance: params.importance,
    followedOnly: params.followedOnly,
    page: params.page,
  })

  return result
}
