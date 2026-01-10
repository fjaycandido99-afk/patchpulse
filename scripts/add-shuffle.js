const fs = require('fs');
const filePath = 'app/(main)/videos/queries.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Add shuffle to getVideos function
const oldGetVideos = `// Transform the data to match our type (Supabase returns game as array for joins)
  return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getFeaturedVideos`;

const newGetVideos = `// Transform the data to match our type (Supabase returns game as array for joins)
  const videos = (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]

  // Shuffle for variety on each refresh (Fisher-Yates algorithm)
  for (let i = videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [videos[i], videos[j]] = [videos[j], videos[i]]
  }

  return videos
}

export async function getFeaturedVideos`;

content = content.replace(oldGetVideos, newGetVideos);

// Add shuffle to getForYouVideos function
const oldForYou = `const personalizedVideos = (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]

  // If user has few/no personalized videos, supplement with trending`;

const newForYou = `let personalizedVideos = (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]

  // Shuffle for variety on each refresh (Fisher-Yates algorithm)
  for (let i = personalizedVideos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [personalizedVideos[i], personalizedVideos[j]] = [personalizedVideos[j], personalizedVideos[i]]
  }

  // If user has few/no personalized videos, supplement with trending`;

content = content.replace(oldForYou, newForYou);

// Also shuffle getTrendingVideos
const oldTrending = `return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getVideoTypes`;

const newTrending = `const videos = (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]

  // Shuffle for variety on each refresh (Fisher-Yates algorithm)
  for (let i = videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [videos[i], videos[j]] = [videos[j], videos[i]]
  }

  return videos
}

export async function getVideoTypes`;

content = content.replace(oldTrending, newTrending);

// Also shuffle getFeaturedVideos
const oldFeatured = `return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getTrendingVideos`;

const newFeatured = `const videos = (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]

  // Shuffle for variety on each refresh (Fisher-Yates algorithm)
  for (let i = videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [videos[i], videos[j]] = [videos[j], videos[i]]
  }

  return videos
}

export async function getTrendingVideos`;

content = content.replace(oldFeatured, newFeatured);

fs.writeFileSync(filePath, content);
console.log('Added shuffle to getVideos, getFeaturedVideos, getTrendingVideos, and getForYouVideos');
