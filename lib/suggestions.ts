"use client"

import type { AISuggestion } from "@/lib/types"
import { $createTextNode, TextNode, ParagraphNode, $isLineBreakNode, LineBreakNode, $isTextNode } from "lexical"
import { fuzzyMatch } from "./utils"
import { $createSuggestionDecoratorNode, SuggestionDecoratorNode } from "@/components/editor/suggestions-decorator"


// String suggestions from the paragraph, merging all
// nodes into a single text node.
export function removeSuggestions(paragraph: ParagraphNode) {
    let i = 0
    while (i < paragraph.getChildrenSize()) {
      const current = paragraph.getChildAtIndex(i)

      // Convert SuggestionDecoratorNodes to TextNodes
      if (current instanceof SuggestionDecoratorNode) {
        current.replace($createTextNode(current.getSuggestion().original_text))
        // Don't increment i - the replacement might be mergeable with neighbors
        // but re-enter the loop so we get the latest version of this node
        continue
      }

      // If current is a TextNode, try to merge with next nodes
      if ($isTextNode(current)) {
        let merged = true
        while (merged && i + 1 < paragraph.getChildrenSize()) {
          const next = paragraph.getChildAtIndex(i + 1)

          if ($isTextNode(next) || next instanceof SuggestionDecoratorNode) {
            current.mergeWithSibling(next)
            // After merge, next node is removed, so we don't increment i
            merged = true
          } else {
            // Hit a LineBreakNode or other node type - stop merging
            merged = false
          }
        }
      }

      // Move to next node
      i++
    }
  }




export function addSuggestions(paragraph: ParagraphNode, allSuggestions: AISuggestion[], paragraphTextOffset: number): AISuggestion[] {
  const suggestions = allSuggestions.filter(s => s.original_text.length > 0 && s.status == "proposed")
  let textOffset = paragraphTextOffset;
  let remainingSuggestions = suggestions;
  paragraph.getChildren().forEach(node => {
    if($isTextNode(node)) {
      // this is a line -- add suggestions
      remainingSuggestions = addSuggestionsToLine(node, remainingSuggestions, textOffset);
      textOffset += node.getTextContentSize()
    } else if ($isLineBreakNode(node)) {
      // add one to account for the line break
      textOffset += 1;
    } else {
      console.log("unexpected node type in paragraph: ", node)
    }
  })

  return remainingSuggestions
}
export function addSuggestionsToLine(line: TextNode, suggestions: AISuggestion[], textOffset: number): AISuggestion[] {
  const lineText = line.getTextContent();

  const matchingSuggestions: { start: number, end: number, suggestion: AISuggestion}[] = []

  // find all fuzzy-matched suggestions and return the remaining elements
  const remainingSuggestions = suggestions.filter((suggestion) => {
    // when looking for the fuzzyMatch, we need to subtract the paragraph text offset since we're looking
    // for the index within the paragraph
    const match = fuzzyMatch(lineText, suggestion.original_text, suggestion.start_index - textOffset)
    if (match !== -1) {
      matchingSuggestions.push({
        start: match,
        end: match + suggestion.original_text.length,
        suggestion: suggestion
      })
      return false
    } else {
      return true
    }
  })

  // sort suggestions, and only keep non-overlapping suggestions
  // put indexes into an offset list
  matchingSuggestions.sort((a, b) => a.start - b.start)
  let lastIndex = 0;
  const offsets: number[] = []
  matchingSuggestions.filter(match => {
    if (match.start < lastIndex) {
      // console.log("overlapping suggestion -- dropping", match)
      return false
    } else {
      offsets.push(match.start, match.end)
      lastIndex = match.end
      return true
    }
  })


  // console.log("splitting text node", textNode, offsets)
  const splitNodes = line.splitText(...offsets);
  // console.log("split nodes", splitNodes)
  let offset = 0;
  let nextMatch = 0;

  splitNodes.forEach(node => {
    const match = matchingSuggestions[nextMatch]
    if(match) {
      if (match.start == offset) {
        // console.log("matching node", match, node)
        node.replace($createSuggestionDecoratorNode(match.suggestion))
        nextMatch++;
      }
    } else {
      // console.log("no match found for node", node)
    }
    offset += node.getTextContentSize()
  })

  return remainingSuggestions
}


