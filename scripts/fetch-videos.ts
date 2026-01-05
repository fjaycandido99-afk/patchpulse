import { fetchAllGameVideos } from '../lib/youtube/api'

async function main() {
  console.log('Starting video fetch...')

  try {
    const result = await fetchAllGameVideos()
    console.log('Video fetch complete!')
    console.log(`Games checked: ${result.gamesChecked}`)
    console.log(`Videos added: ${result.totalAdded}`)
    if (result.errors) {
      console.log('Errors:', result.errors)
    }
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    process.exit(1)
  }
}

main()
