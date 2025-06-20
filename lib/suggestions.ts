"use client"

import type { AISuggestion } from "@/lib/types"
import { $createTextNode, TextNode, ParagraphNode } from "lexical"
import { fuzzyMatch } from "./utils"
import { $createSuggestionDecoratorNode, SuggestionDecoratorNode } from "@/components/editor/suggestions-decorator"



// String suggestions from the paragraph, merging all
// nodes into a single text node.
export function removeSuggestions(paragraph: ParagraphNode) {
  let mergedNode = $createTextNode("")
  // insert new empty text node at the beginning of the paragraph
  const firstChild = paragraph.getChildAtIndex(0)
  if (firstChild instanceof TextNode) {
    firstChild.insertBefore(mergedNode)
  } else {
    paragraph.append(mergedNode)
  }
  // console.log("pre-merged", paragraph.getChildren())

  // turn all suggestions back into text nodes
  // and merge all text nodes into a single text node
  while(paragraph.getChildrenSize() > 1) {
    const paragraphLatest = paragraph.getLatest();
    let first = paragraphLatest.getChildAtIndex(0)
    const second = paragraphLatest.getChildAtIndex(1)
    // console.log("merging nodes", first, second)
    if(first instanceof SuggestionDecoratorNode) {
      first = first.replace($createTextNode(first.getSuggestion().original_text))
    } 
    if(first instanceof TextNode) {
      if (second instanceof SuggestionDecoratorNode) {
        first.mergeWithSibling(second as TextNode)
      } else if (second instanceof TextNode) {
        first.mergeWithSibling(second)
      } else {
        console.log("unknown node", second)
        break;
      }
    } else {
      console.log("unknown node", first)
    }
  }

  // console.log("post-merged", paragraph.getChildren())
}
// add the 
export function addSuggestions(paragraph: ParagraphNode, allSuggestions: AISuggestion[], paragraphTextOffset: number): AISuggestion[] {
  const paragraphText = paragraph.getTextContent();
  const suggestions = allSuggestions.filter(s => s.original_text.length > 0 && s.status == "proposed")

  const matchingSuggestions: { start: number, end: number, suggestion: AISuggestion}[] = []

  // find all fuzzy-matched suggestions and return the remaining elements
  const remainingSuggestions = suggestions.filter((suggestion) => {
    // when looking for the fuzzyMatch, we need to subtract the paragraph text offset since we're looking
    // for the index within the paragraph
    const match = fuzzyMatch(paragraphText, suggestion.original_text, suggestion.start_index - paragraphTextOffset)
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

  const textNodes = paragraph.getChildren();
  
  if(textNodes.length == 0) {
    paragraph.append($createTextNode(""))
  }
  else if(textNodes.length !== 1) {
    console.log("expected a single text node, got", textNodes)
  }

  const textNode = paragraph.getChildren()[0]

  if(textNode instanceof TextNode) {
    // console.log("splitting text node", textNode, offsets)
    const splitNodes = textNode.splitText(...offsets);
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

  } else {
    console.log("unexpected node: ", textNode)
  }

  return remainingSuggestions
}


