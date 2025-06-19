"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import type { AISuggestion } from "@/lib/types"
import { $createTextNode, $getRoot, LexicalNode, TextNode, ElementNode } from "lexical"

interface SuggestionPluginProps {
  suggestions: AISuggestion[]
  setSuggestions: (suggestions: AISuggestion[]) => void
  setIsApplyingSuggestions?: (isApplying: boolean) => void
}

export function SuggestionPlugin({ suggestions, setSuggestions, setIsApplyingSuggestions }: SuggestionPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (setIsApplyingSuggestions) {
      setIsApplyingSuggestions(true)
    }

    // Use microtask to avoid flushSync error during React rendering
    queueMicrotask(() => {
      editor.update(() => {
        const root = $getRoot()

        // Get all text nodes
        function getTextNodes(): TextNode[] {
          const textNodes: TextNode[] = []
          const traverse = (node: LexicalNode) => {
            if (node instanceof TextNode) {
              textNodes.push(node)
            } else if (node instanceof ElementNode) {
              node.getChildren().forEach(traverse)
            }
          }
          root.getChildren().forEach(traverse)
          return textNodes
        }

        const textNodes = getTextNodes()
        const fullText = textNodes.map(node => node.getTextContent()).join('')

        // For now, just log the suggestions without applying them visually
        // This avoids the decorator node registration issue
        if (suggestions.length > 0) {
          console.log('Suggestions available:', suggestions.length)
          console.log('Current text:', fullText)
        }

        if (setIsApplyingSuggestions) {
          setIsApplyingSuggestions(false)
        }
      })
    })
  }, [suggestions, editor, setIsApplyingSuggestions])

  return null
}

// eslint-disable-next-line react-hooks/exhaustive-deps

