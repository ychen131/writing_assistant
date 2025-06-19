"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import type { AISuggestion } from "@/lib/types"
import { $createTextNode, $getRoot, DecoratorNode, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, TextNode, ElementNode, ParagraphNode } from "lexical"
import type { JSX } from "react"

export class SuggestionDecoratorNode extends DecoratorNode<JSX.Element> {
  __suggestion: AISuggestion
  __originalNode: SerializedLexicalNode

  static getType(): string {
    return "suggestion-decorator"
  }

  static clone(node: SuggestionDecoratorNode): SuggestionDecoratorNode {
    return new SuggestionDecoratorNode(node.__suggestion, node.__originalNode, node.__key)
  }

  constructor(suggestion: AISuggestion, originalNode: SerializedLexicalNode, key?: NodeKey) {
    super(key)
    this.__suggestion = suggestion
    this.__originalNode = originalNode
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement("span")

    // Apply different background colors based on suggestion type
    const getBackgroundColor = (type: "spelling" | "grammar" | "style") => {
      switch (type) {
        case "spelling":
          return "bg-red-200"
        case "grammar":
          return "bg-blue-200"
        case "style":
          return "bg-orange-200"
        default:
          return "bg-gray-200"
      }
    }

    const suggestionType = this.__suggestion.type as "spelling" | "grammar" | "style"
    element.className = `suggestion-highlight ${getBackgroundColor(suggestionType)} px-1 rounded cursor-pointer hover:opacity-80 transition-opacity`
    return element
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <>
        {this.__suggestion.original_text}
      </>
    )
  }

  getTextContent(): string {
    return this.__suggestion.original_text
  }

  getSuggestion(): AISuggestion {
    return this.__suggestion
  }

  static importJSON(json: SerializedLexicalNode): LexicalNode {
    const jsonData = json.$ as { suggestion: AISuggestion; originalNode: SerializedLexicalNode }
    const node = new SuggestionDecoratorNode(jsonData.suggestion, jsonData.originalNode)
    return node
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: "suggestion-decorator",
      version: 1,
      $: {
        suggestion: this.__suggestion,
        originalNode: this.__originalNode,
      }
    }
  }
}

function $createSuggestionDecoratorNode(suggestion: AISuggestion, originalNode: SerializedLexicalNode): SuggestionDecoratorNode {
  return new SuggestionDecoratorNode(suggestion, originalNode)
}

interface SuggestionPluginProps {
  suggestions: AISuggestion[]
  setSuggestions: (suggestions: AISuggestion[]) => void
  setIsApplyingSuggestions?: (isApplyingSuggestions: boolean) => void
}

export function SuggestionPlugin({ suggestions, setSuggestions, setIsApplyingSuggestions }: SuggestionPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (setIsApplyingSuggestions) {
      setIsApplyingSuggestions(true)
    }
    // if (!editor.hasNodes([SuggestionDecoratorNode])) {
    //   editor.registerNodeTransform(SuggestionDecoratorNode, () => {})
    // }

    editor.update(() => {
      const root = $getRoot()



      // Process each suggestion
      suggestions.forEach((suggestion) => {
        if (suggestion.status === "ignored") {
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const startIndex = suggestion.start_index
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const endIndex = suggestion.end_index
        let found = false
        let lastSeenIndex = 0;
        console.log("searching for range", suggestion)
        // Find the text node that contains this suggestion
        // iterate paragrap by paragraph
        for (const paragraph of root.getChildren()) {
          if (paragraph instanceof ParagraphNode) {
            const paragraphText = paragraph.getTextContent()
            if (paragraphText.includes(suggestion.original_text)) {
              console.log("found suggestion in paragraph", paragraphText)
              found = true;
              const relativeStart = paragraphText.indexOf(suggestion.original_text)

              for (const textNode of paragraph.getChildren()) {
                const nodeText = textNode.getTextContent()
                if (textNode instanceof TextNode) {
                  if (lastSeenIndex <= relativeStart && relativeStart < lastSeenIndex + nodeText.length) {
                    console.log("found suggestion in text node", nodeText)
                    found = true;
                    const relativeStart = nodeText.indexOf(suggestion.original_text)
                    const relativeEnd = relativeStart + suggestion.original_text.length
                    const splitNodes = textNode.splitText(relativeStart, relativeEnd)
                    if (splitNodes.length > 1) {
                      splitNodes[1].replace($createSuggestionDecoratorNode(suggestion, splitNodes[1].exportJSON()))
                    }
                  }
                }
                lastSeenIndex += nodeText.length
              }
            } else {
              console.log("unknown node", paragraph)
            }

          }
        }
        if (!found) {
          console.log("no matching text node found", suggestion)
          if (suggestion.status === "accepted") {
            setSuggestions(suggestions.map((s: AISuggestion) => s.id === suggestion.id ? { ...s, status: "proposed" } : s))
          }
        }
      })
    })

    if (setIsApplyingSuggestions) {
      setIsApplyingSuggestions(false)
    }
  }, [suggestions, editor])

  return null
}

// eslint-disable-next-line react-hooks/exhaustive-deps

