import { SuggestionDecoratorNode } from "@/components/editor/suggestion-plugin"
import { clsx, type ClassValue } from "clsx"
import { ElementNode, LexicalNode } from "lexical"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function stripSuggestions(root: LexicalNode) {
  const traverse = (node: LexicalNode) => {
    if (node instanceof SuggestionDecoratorNode) {
    } else if (node instanceof ElementNode) {
      node.getChildren().forEach(traverse)
    }
  }
  return traverse(root)
}