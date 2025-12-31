import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RiotStats = {
  lol?: {
    summonerLevel: number
    profileIconId: number
    rankedSolo?: {
      tier: string
      rank: string
      leaguePoints: number
      wins: number
      losses: number
    }
    rankedFlex?: {
      tier: string
      rank: string
      leaguePoints: number
      wins: number
      losses: number
    }
    topChampions: Array<{
      championId: number
      championName: string
      masteryLevel: number
      masteryPoints: number
    }>
  }
  valorant?: {
    currentTier: number
    currentTierName: string
    ranking: number
    gamesPlayed: number
    wins: number
    topAgents: Array<{
      agentId: string
      agentName: string
      gamesPlayed: number
      wins: number
    }>
  }
}

// Champion ID to name mapping (top 50 most popular)
const CHAMPION_NAMES: Record<number, string> = {
  1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'Twisted Fate', 5: 'Xin Zhao',
  6: 'Urgot', 7: 'LeBlanc', 8: 'Vladimir', 9: 'Fiddlesticks', 10: 'Kayle',
  11: 'Master Yi', 12: 'Alistar', 13: 'Ryze', 14: 'Sion', 15: 'Sivir',
  16: 'Soraka', 17: 'Teemo', 18: 'Tristana', 19: 'Warwick', 20: 'Nunu & Willump',
  21: 'Miss Fortune', 22: 'Ashe', 23: 'Tryndamere', 24: 'Jax', 25: 'Morgana',
  26: 'Zilean', 27: 'Singed', 28: 'Evelynn', 29: 'Twitch', 30: 'Karthus',
  31: "Cho'Gath", 32: 'Amumu', 33: 'Rammus', 34: 'Anivia', 35: 'Shaco',
  36: 'Dr. Mundo', 37: 'Sona', 38: 'Kassadin', 39: 'Irelia', 40: 'Janna',
  41: 'Gangplank', 42: 'Corki', 43: 'Karma', 44: 'Taric', 45: 'Veigar',
  48: 'Trundle', 50: 'Swain', 51: 'Caitlyn', 53: 'Blitzcrank', 54: 'Malphite',
  55: 'Katarina', 56: 'Nocturne', 57: 'Maokai', 58: 'Renekton', 59: 'Jarvan IV',
  60: 'Elise', 61: 'Orianna', 62: 'Wukong', 63: 'Brand', 64: 'Lee Sin',
  67: 'Vayne', 68: 'Rumble', 69: 'Cassiopeia', 72: 'Skarner', 74: 'Heimerdinger',
  75: 'Nasus', 76: 'Nidalee', 77: 'Udyr', 78: 'Poppy', 79: 'Gragas',
  80: 'Pantheon', 81: 'Ezreal', 82: 'Mordekaiser', 83: 'Yorick', 84: 'Akali',
  85: 'Kennen', 86: 'Garen', 89: 'Leona', 90: 'Malzahar', 91: 'Talon',
  92: 'Riven', 96: "Kog'Maw", 98: 'Shen', 99: 'Lux', 101: 'Xerath',
  102: 'Shyvana', 103: 'Ahri', 104: 'Graves', 105: 'Fizz', 106: 'Volibear',
  107: 'Rengar', 110: 'Varus', 111: 'Nautilus', 112: 'Viktor', 113: 'Sejuani',
  114: 'Fiora', 115: 'Ziggs', 117: 'Lulu', 119: 'Draven', 120: 'Hecarim',
  121: "Kha'Zix", 122: 'Darius', 126: 'Jayce', 127: 'Lissandra', 131: 'Diana',
  133: 'Quinn', 134: 'Syndra', 136: 'Aurelion Sol', 141: 'Kayn', 142: 'Zoe',
  143: 'Zyra', 145: "Kai'Sa", 147: 'Seraphine', 150: 'Gnar', 154: 'Zac',
  157: 'Yasuo', 161: "Vel'Koz", 163: 'Taliyah', 164: 'Camille', 166: "Akshan",
  200: "Bel'Veth", 201: 'Braum', 202: 'Jhin', 203: 'Kindred', 221: 'Zeri',
  222: 'Jinx', 223: 'Tahm Kench', 234: 'Viego', 235: 'Senna', 236: 'Lucian',
  238: 'Zed', 240: 'Kled', 245: 'Ekko', 246: 'Qiyana', 254: 'Vi',
  266: 'Aatrox', 267: 'Nami', 268: 'Azir', 350: 'Yuumi', 360: 'Samira',
  412: 'Thresh', 420: 'Illaoi', 421: "Rek'Sai", 427: 'Ivern', 429: 'Kalista',
  432: 'Bard', 497: 'Rakan', 498: 'Xayah', 516: 'Ornn', 517: 'Sylas',
  518: 'Neeko', 523: 'Aphelios', 526: 'Rell', 555: 'Pyke', 711: 'Vex',
  777: 'Yone', 875: "Sett", 876: 'Lillia', 887: 'Gwen', 888: 'Renata Glasc',
  895: 'Nilah', 897: "K'Sante", 901: 'Smolder', 902: 'Milio', 910: 'Hwei',
  950: 'Naafiri', 233: 'Briar'
}

// Valorant tier names
const VALORANT_TIERS: Record<number, string> = {
  0: 'Unranked', 1: 'Unused', 2: 'Unused',
  3: 'Iron 1', 4: 'Iron 2', 5: 'Iron 3',
  6: 'Bronze 1', 7: 'Bronze 2', 8: 'Bronze 3',
  9: 'Silver 1', 10: 'Silver 2', 11: 'Silver 3',
  12: 'Gold 1', 13: 'Gold 2', 14: 'Gold 3',
  15: 'Platinum 1', 16: 'Platinum 2', 17: 'Platinum 3',
  18: 'Diamond 1', 19: 'Diamond 2', 20: 'Diamond 3',
  21: 'Ascendant 1', 22: 'Ascendant 2', 23: 'Ascendant 3',
  24: 'Immortal 1', 25: 'Immortal 2', 26: 'Immortal 3',
  27: 'Radiant'
}

// Valorant agent names
const VALORANT_AGENTS: Record<string, string> = {
  '5f8d3a7f-467b-97f3-062c-13acf203c006': 'Breach',
  'f94c3b30-42be-e959-889c-5aa313dba261': 'Raze',
  '22697a3d-45bf-8dd7-4fec-84a9e28c69d7': 'Chamber',
  '601dbbe7-43ce-be57-2a40-4abd24953621': 'KAY/O',
  '6f2a04ca-43e0-be17-7f36-b3908627744d': 'Skye',
  '117ed9e3-49f3-6512-3ccf-0cada7e3823b': 'Cypher',
  '320b2a48-4d9b-a075-30f1-1f93a9b638fa': 'Sova',
  '1e58de9c-4950-5125-93e9-a0aee9f98746': 'Killjoy',
  '707eab51-4836-f488-046a-cda6bf494859': 'Viper',
  'eb93336a-449b-9c1b-0a54-a891f7921d69': 'Phoenix',
  '41fb69c1-4189-7b37-f117-bcaf1e96f1bf': 'Astra',
  '9f0d8ba9-4140-b941-57d3-a7ad57c6b417': 'Brimstone',
  '7f94d92c-4234-0a36-9646-3a87eb8b5c89': 'Yoru',
  'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc': 'Reyna',
  '569fdd95-4d10-43ab-ca70-79becc718b46': 'Sage',
  '8e253930-4c05-31dd-1b6c-968525494517': 'Omen',
  'add6443a-41bd-e414-f6ad-e58d267f4e95': 'Jett',
  'dade69b4-4f5a-8528-247b-219e5a1facd6': 'Fade',
  'e370fa57-4757-3604-3648-499e1f642d3f': 'Gekko',
  'cc8b64c8-4b25-4ff9-6e7f-37b4da43d235': 'Deadlock',
  '95b78ed7-4637-86d9-7e41-71ba8c293152': 'Harbor',
  '1dbf2edd-4729-0984-3115-daa5eed44993': 'Clove',
  'bb2a4828-46eb-8cd1-e765-15848195d751': 'Neon',
  '0e38b510-41a8-5780-5e8f-568b2a4f2d6c': 'Iso'
}

async function getLolStats(puuid: string, region: string, apiKey: string): Promise<RiotStats['lol'] | null> {
  try {
    // Get summoner by PUUID
    const summonerRes = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': apiKey } }
    )

    if (!summonerRes.ok) {
      if (summonerRes.status === 404) return null // No LoL account
      throw new Error('Failed to fetch summoner')
    }

    const summoner = await summonerRes.json()

    // Get ranked stats
    const rankedRes = await fetch(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
      { headers: { 'X-Riot-Token': apiKey } }
    )

    let rankedSolo, rankedFlex
    if (rankedRes.ok) {
      const rankedData = await rankedRes.json()
      for (const entry of rankedData) {
        if (entry.queueType === 'RANKED_SOLO_5x5') {
          rankedSolo = {
            tier: entry.tier,
            rank: entry.rank,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
          }
        } else if (entry.queueType === 'RANKED_FLEX_SR') {
          rankedFlex = {
            tier: entry.tier,
            rank: entry.rank,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
          }
        }
      }
    }

    // Get champion mastery (top 5)
    const masteryRes = await fetch(
      `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5`,
      { headers: { 'X-Riot-Token': apiKey } }
    )

    let topChampions: Array<{
      championId: number
      championName: string
      masteryLevel: number
      masteryPoints: number
    }> = []
    if (masteryRes.ok) {
      const masteryData = await masteryRes.json()
      topChampions = masteryData.map((m: { championId: number; championLevel: number; championPoints: number }) => ({
        championId: m.championId,
        championName: CHAMPION_NAMES[m.championId] || `Champion ${m.championId}`,
        masteryLevel: m.championLevel,
        masteryPoints: m.championPoints,
      }))
    }

    return {
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      rankedSolo,
      rankedFlex,
      topChampions,
    }
  } catch (err) {
    console.error('Error fetching LoL stats:', err)
    return null
  }
}

async function getValorantStats(puuid: string, region: string, apiKey: string): Promise<RiotStats['valorant'] | null> {
  try {
    // Get MMR/Ranked data
    // Note: Valorant API is more limited - we use what's available
    const mmrRes = await fetch(
      `https://${region}.api.riotgames.com/val/ranked/v1/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': apiKey } }
    )

    if (!mmrRes.ok) {
      if (mmrRes.status === 404) return null // No Valorant account
      // Valorant API might not be available in all regions or for all accounts
      return null
    }

    const mmrData = await mmrRes.json()

    return {
      currentTier: mmrData.currenttier || 0,
      currentTierName: VALORANT_TIERS[mmrData.currenttier] || 'Unranked',
      ranking: mmrData.ranking_in_tier || 0,
      gamesPlayed: mmrData.number_of_games || 0,
      wins: mmrData.wins || 0,
      topAgents: [], // Would need match history API for this
    }
  } catch (err) {
    console.error('Error fetching Valorant stats:', err)
    return null
  }
}

export async function GET() {
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const apiKey = process.env.RIOT_API_KEY

  if (!apiKey) {
    return NextResponse.redirect(`${returnUrl}/profile?error=riot_api_not_configured`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${returnUrl}/login`)
  }

  // Get Riot account
  const { data: riotAccount } = await supabase
    .from('connected_accounts')
    .select('external_user_id, metadata')
    .eq('user_id', user.id)
    .eq('provider', 'riot')
    .single()

  if (!riotAccount) {
    return NextResponse.redirect(`${returnUrl}/profile?error=riot_not_connected`)
  }

  const puuid = riotAccount.external_user_id

  try {
    // Fetch stats from both games
    // Try different regions - NA is most common
    const regions = ['na1', 'euw1', 'kr', 'br1']
    let lolStats: RiotStats['lol'] | null = null
    let valorantStats: RiotStats['valorant'] | null = null

    // Try to get LoL stats from different regions
    for (const region of regions) {
      if (!lolStats) {
        lolStats = await getLolStats(puuid, region, apiKey)
      }
    }

    // Valorant uses different region format
    const valRegions = ['na', 'eu', 'kr', 'br']
    for (const region of valRegions) {
      if (!valorantStats) {
        valorantStats = await getValorantStats(puuid, region, apiKey)
      }
    }

    // Update metadata with stats
    const metadata = {
      ...(riotAccount.metadata as Record<string, unknown> || {}),
      lol: lolStats,
      valorant: valorantStats,
      lastSyncAt: new Date().toISOString(),
    }

    await supabase
      .from('connected_accounts')
      .update({
        metadata,
        last_sync_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('provider', 'riot')

    const hasLol = !!lolStats
    const hasVal = !!valorantStats

    return NextResponse.redirect(
      `${returnUrl}/profile?riot=synced&lol=${hasLol}&valorant=${hasVal}`
    )
  } catch (err) {
    console.error('Riot sync error:', err)
    return NextResponse.redirect(`${returnUrl}/profile?error=riot_sync_failed`)
  }
}
