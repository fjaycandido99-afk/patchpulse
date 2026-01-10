const fs = require('fs');
const filePath = 'app/(main)/videos/queries.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Helper function to add shuffle after a return statement
function addShuffle(content, oldReturn, varName) {
  const newCode = oldReturn
    .replace('return (data || []).map', `const ${varName} = (data || []).map`)
    .replace(') as VideoWithGame[]', `) as VideoWithGame[]

  // Shuffle for variety on each refresh (Fisher-Yates algorithm)
  for (let i = ${varName}.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [${varName}[i], ${varName}[j]] = [${varName}[j], ${varName}[i]]
  }

  return ${varName}`);
  return content.replace(oldReturn, newCode);
}

// Fix getVideos - find by the unique comment before it
const getVideosPattern = `  // Transform the data to match our type (Supabase returns game as array for joins)
  return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getFeaturedVideos`;

if (content.includes(getVideosPattern)) {
  content = content.replace(getVideosPattern, `  // Transform the data to match our type (Supabase returns game as array for joins)
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

export async function getFeaturedVideos`);
  console.log('Fixed getVideos');
}

// Fix getFeaturedVideos
const getFeaturedPattern = `  return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getTrendingVideos`;

if (content.includes(getFeaturedPattern)) {
  content = content.replace(getFeaturedPattern, `  const videos = (data || []).map((item) => ({
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

export async function getTrendingVideos`);
  console.log('Fixed getFeaturedVideos');
}

// Fix getTrendingVideos
const getTrendingPattern = `  return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getVideoTypes`;

if (content.includes(getTrendingPattern)) {
  content = content.replace(getTrendingPattern, `  const videos = (data || []).map((item) => ({
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

export async function getVideoTypes`);
  console.log('Fixed getTrendingVideos');
}

fs.writeFileSync(filePath, content);
console.log('Done!');
