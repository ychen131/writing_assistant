import { AISuggestion } from "@/lib/types"
import { DecoratorNode, NodeKey, EditorConfig, SerializedLexicalNode, LexicalNode, TextNode } from "lexical"
import { JSX } from "react"

export class SuggestionDecoratorNode extends TextNode {
    __suggestion: AISuggestion
  
    static getType(): string {
      return "suggestion-decorator"
    }
  
    static clone(node: SuggestionDecoratorNode): SuggestionDecoratorNode {
      return new SuggestionDecoratorNode(node.__suggestion, node.__key)
    }
  
    constructor(suggestion: AISuggestion, key?: NodeKey) {
      super(suggestion.original_text, key)
      this.__suggestion = suggestion
    }
  
    createDOM(config: EditorConfig): HTMLElement {
      // const element = document.createElement("span")
  
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
      const element = super.createDOM(config);
      element.className = `suggestion-highlight ${getBackgroundColor(suggestionType)} px-1 rounded hover:opacity-80 transition-opacity`
      return element
    }
  
    updateDOM(): false {
      return false
    }
  
    isInline(): true {
      return true
    }
  
    getSuggestion(): AISuggestion {
      return this.__suggestion
    }
  }
  
  export function $createSuggestionDecoratorNode(suggestion: AISuggestion): SuggestionDecoratorNode {
    return new SuggestionDecoratorNode(suggestion)
  }