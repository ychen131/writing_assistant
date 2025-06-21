"use client"

export interface ParagraphData {
  id: string
  text: string
  startOffset: number
  hash: string // For change detection
}

// Extract paragraphs from text, splitting on double newlines
export function extractParagraphs(text: string): ParagraphData[] {
  const paragraphs: ParagraphData[] = []
  const parts = text.split('\n\n')
  let currentOffset = 0
  
  parts.forEach((paragraph, index) => {
    if (paragraph.trim().length > 0) {
      paragraphs.push({
        id: `para-${index}`,
        text: paragraph,
        startOffset: currentOffset,
        hash: generateSimpleHash(paragraph)
      })
    }
    currentOffset += paragraph.length + 2 // Add 2 for the '\n\n'
  })
  
  return paragraphs
}

// Simple hash function for change detection
function generateSimpleHash(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}

// Compare two sets of paragraphs and return which ones have changed
export function detectChangedParagraphs(
  oldParagraphs: ParagraphData[], 
  newParagraphs: ParagraphData[]
): ParagraphData[] {
  const oldHashMap = new Map(oldParagraphs.map(p => [p.id, p.hash]))
  
  return newParagraphs.filter(newPara => {
    const oldHash = oldHashMap.get(newPara.id)
    return !oldHash || oldHash !== newPara.hash
  })
}

// Merge suggestions from different paragraphs, handling position adjustments
export function mergeParagraphSuggestions(
  existingSuggestions: any[],
  newSuggestions: any[],
  changedParagraphIds: string[]
): any[] {
  // Remove suggestions from changed paragraphs
  const filteredExisting = existingSuggestions.filter(suggestion => {
    // This is a simple approach - in a real implementation, you'd need to 
    // map suggestions back to their paragraph IDs
    return !changedParagraphIds.some(id => {
      // Check if this suggestion belongs to a changed paragraph
      // This would need more sophisticated logic based on your data structure
      return false // Placeholder
    })
  })
  
  // Add new suggestions
  return [...filteredExisting, ...newSuggestions]
}