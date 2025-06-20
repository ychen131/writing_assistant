import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fuzzyMatch(text: string, pattern: string, expectedPosition: number): number {
  // fuzzy match and find the closest match to the suggestion
  var matches = []
  for (let i = 0; i < text.length; i++) {
    if (text.substring(i, i + pattern.length) === pattern) {
      matches.push(i)
    }
  }
  if (matches.length === 0) {
    // console.log("no matches found for suggestion", suggestion)
    return -1
  }

  const closestMatch = matches.sort((a, b) => Math.abs(a - expectedPosition) - Math.abs(b - expectedPosition))[0]
  return closestMatch
}