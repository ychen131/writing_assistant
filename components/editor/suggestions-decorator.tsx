import { AISuggestion } from "@/lib/types"
import { NodeKey, EditorConfig, TextNode } from "lexical"

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
      const element = super.createDOM(config)

      const getHighlightClassName = (type: string) => {
        switch (type) {
          case "spelling":
          case "accuracy":
            return "underline-red"
          case "grammar":
          case "style":
            return "highlight-green"
          default:
            return "" // No highlight for other types
        }
      }

      const suggestionType = this.__suggestion.type
      const highlightClass = getHighlightClassName(suggestionType)

      if (highlightClass) {
        element.className = `${highlightClass} cursor-pointer`
      }

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