export function getImportanceLabel(score: number): 'Major' | 'Medium' | 'Minor' {
  if (score >= 8) return 'Major'
  if (score >= 5) return 'Medium'
  return 'Minor'
}

export function getImportanceRange(
  importance: 'major' | 'medium' | 'minor'
): { min: number; max: number } {
  switch (importance) {
    case 'major':
      return { min: 8, max: 10 }
    case 'medium':
      return { min: 5, max: 7 }
    case 'minor':
      return { min: 1, max: 4 }
  }
}
