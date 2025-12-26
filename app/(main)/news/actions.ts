'use server'

import { markNewsVisited } from './queries'

export async function markNewsAsVisited(): Promise<void> {
  await markNewsVisited()
}
