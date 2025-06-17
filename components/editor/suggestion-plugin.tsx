"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import type { AISuggestion } from "@/lib/types"
import { $createTextNode, $getRoot, $getSelection, $isRangeSelection, DecoratorNode, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, TextNode, ElementNode } from "lexical"
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
    // element.className = `suggestion-${this.__suggestion.type}`
    element.className = "border-b-2 border-red-400 border"
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

  getSuggestion(): AISuggestion {
    return this.__suggestion
  }

  static importJSON(json: SerializedLexicalNode): LexicalNode {
    const node = new SuggestionDecoratorNode((json.$ as any)['suggestion'] as AISuggestion, (json.$ as any)['originalNode'] as SerializedLexicalNode)
    return node
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: "suggestion-decorator",
      version: 1,
      $: { suggestion: this.__suggestion,
      originalNode: this.__originalNode, }
    }
  }
}

function $createSuggestionDecoratorNode(suggestion: AISuggestion, originalNode: SerializedLexicalNode): SuggestionDecoratorNode {
  return new SuggestionDecoratorNode(suggestion, originalNode)
}

interface SuggestionPluginProps {
  suggestions: AISuggestion[]
  onSuggestionClick?: (id: string) => void
  selectedSuggestionId?: string | null
}

export function SuggestionPlugin({ suggestions, onSuggestionClick, selectedSuggestionId }: SuggestionPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // if (!editor.hasNodes([SuggestionDecoratorNode])) {
    //   editor.registerNodeTransform(SuggestionDecoratorNode, () => {})
    // }

    editor.update(() => {
      const root = $getRoot()
      
      // First, remove any existing suggestion decorators
      // const decorators = root.getChildren().filter((node) => node instanceof SuggestionDecoratorNode)
      // decorators.forEach((node) => node.remove())

      // Get all text nodes in the editor
        const textNodes: TextNode[] = []
        const traverse = (node: LexicalNode) => {
          if (node instanceof TextNode) {
            node.setStyle("") 
            textNodes.push(node)
          } else if (node instanceof SuggestionDecoratorNode) {
            const textNode = $createTextNode(node.getSuggestion().original_text)
            textNodes.push(node.replace(textNode))
          } else if (node instanceof ElementNode) {
            node.getChildren().forEach(traverse)
          }
        }
        root.getChildren().forEach(traverse)

      // Process each suggestion
      suggestions.forEach((suggestion) => {
        const startIndex = suggestion.start_index
        const endIndex = suggestion.end_index
        let found = false
        let lastSeenIndex = 0;
        console.log("searching for range", suggestion)
        // Find the text node that contains this suggestion
        for (const textNode of textNodes) {
          const nodeStart = lastSeenIndex;
          const nodeLength = textNode.getTextContentSize();
          lastSeenIndex += nodeLength;
          const nodeEnd = nodeStart + nodeLength;
          const nodeText = textNode.getTextContent()

          // Check if this node contains the suggestion
          if (startIndex >= nodeStart || endIndex <= nodeEnd) {
            console.log("found suggestion in range", nodeStart, nodeEnd);
            found = true;
            // Calculate the relative positions within this node
            const relativeStart = startIndex - nodeStart
            const relativeEnd = endIndex - nodeStart + 1

            console.log("splitting node", textNode, relativeStart, relativeEnd)
            // const splitNodes = textNode.splitText(relativeStart, relativeEnd)
            // console.log("splitNodes", splitNodes)
            // if (splitNodes.length > 1) {
            //   splitNodes[1].replace($createSuggestionDecoratorNode(suggestion, splitNodes[1].exportJSON()))
            //   // splitNodes[1].setStyle("@apply border-b-2 border-red-400 border-dotted;")
            // }
            // splitNodes[1].setStyle("background-color:rgb(249, 19, 19);")

            // // Split the node into three parts
            // const beforeText = nodeText.slice(0, relativeStart)
            // const suggestionText = nodeText.slice(relativeStart, relativeEnd)
            // const afterText = nodeText.slice(relativeEnd)

            // // Create new nodes
            // const beforeNode = $createTextNode(beforeText)
            // const afterNode = $createTextNode(afterText)
            // const decoratorNode = $createTextNode(suggestion.original_text)
            // decoratorNode.setStyle("background-color: #f0f0f0;")

            // // Replace the original node with the three new nodes
            // textNode.replace(beforeNode)
            // beforeNode.insertAfter(decoratorNode)
            // decoratorNode.insertAfter(afterNode)

            break // Move to next suggestion
          } else {
            console.log("not an overlap", nodeStart, nodeEnd, nodeText)
          }
        }
        if (!found) {
          console.log("no matching text node found", suggestion)
        }
      })
    })
  }, [suggestions, editor])

  return null
}
