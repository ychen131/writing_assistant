import { SuggestionDecoratorNode } from "@/components/editor/suggestion-plugin"
import { clsx, type ClassValue } from "clsx"
import { $createTextNode, ElementNode, LexicalNode, RootNode, TextNode } from "lexical"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function stripSuggestions(root: LexicalNode) {
  const traverse = (node: LexicalNode) => {
    if (node instanceof SuggestionDecoratorNode) {
      const textNode = $createTextNode(node.getSuggestion().original_text)
    } else if (node instanceof ElementNode) {
      node.getChildren().forEach(traverse)
    }
  }
  return traverse(root)
}