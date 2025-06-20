"use client"
import { $getRoot, $createTextNode, $createParagraphNode, type EditorState, TextNode, $getSelection, $setSelectionFromCaretRange, $createRangeSelection, $setSelection, RangeSelection } from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import React, { useState, useEffect } from "react"

import { $createSuggestionDecoratorNode, SuggestionDecoratorNode, SuggestionPlugin } from "./suggestion-plugin"
import type { AISuggestion } from "@/lib/types"
import { useDebounce } from "@/hooks/use-debounce"
import { fuzzyMatch } from "@/lib/utils"

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
}

function onError(error: Error) {
  console.error(error)
}

interface LexicalEditorProps {
  initialContent?: string | null
  initialText: string
  needsSync: boolean
  setSynced: () => void
  onChange?: (editorState: EditorState) => void
  onTextChange?: (text: string) => void
  suggestions: AISuggestion[]
  onSuggestionClick?: (id: string) => void
  selectedSuggestionId?: string | null
}

function MyOnChangePlugin({
  onChange,
  onTextChange,
}: { onChange?: (editorState: EditorState) => void; onTextChange?: (text: string) => void }) {
  const [editor] = useLexicalComposerContext()

  return (
    <OnChangePlugin
      ignoreSelectionChange={true}
      onChange={(editorState) => {
        onChange?.(editorState)

        if (onTextChange) {
          editorState.read(() => {
            const root = $getRoot()
            const text = root.getTextContent()
            onTextChange(text)
          })
        }
      }}
    />
  )
}

interface TextInitializerProps {
  initialText: string
  isInitialized: boolean
  setInitialized: () => void
  suggestions: AISuggestion[]
}

function TextInitializer({ initialText, isInitialized, setInitialized, suggestions }: TextInitializerProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (initialText && !isInitialized) {

      // TODO: 
      // - handle initial text XOR suggestions
      // - ignore suggestions if the text was updated since the last sync
      
      editor.update(() => {
        const root = $getRoot()
        root.clear();
        // const initialSelection = $getSelection()?.clone()?.getStartEndPoints() ?? null;
        console.log("initialize editor state", initialText, suggestions)

        if (initialText.length == 0) {
          const paragraphNode = $createParagraphNode()
          const textNode = $createTextNode("")
          paragraphNode.append(textNode)
          root.append(paragraphNode)
          return
        }


        let paragraphStart = 0;
        let paragraphEnd = 0;
        const paragraphs = initialText.split('\n\n')

        const replacementNodes = paragraphs.map((paragraph) => {
          paragraphEnd = paragraphStart + paragraph.length
          const paragraphNode = $createParagraphNode()
          suggestions.sort((a, b) => a.start_index - b.start_index)
          const { result: nodes, remainingSuggestions } = splitBySuggestions(paragraph, paragraphStart, paragraphEnd, suggestions)
          suggestions = remainingSuggestions
          nodes.forEach((node) => {
            paragraphNode.append(node)
          })
          paragraphStart = paragraphEnd + 2; // add two for the newline characters
          return paragraphNode
        })


        suggestions.forEach((suggestion) => {
          console.log("suggestion not found in text:", suggestion)
        })


        const numParagraphNodes = root.getChildren().length;
        const numParagraphs = paragraphs.length;

        if (numParagraphNodes != numParagraphs) {
          console.log("paragraphs mismatch", numParagraphNodes, numParagraphs)
          // we'll just straight up replace the root with the new nodes
          root.clear()
          replacementNodes.forEach((node) => {
            root.append(node)
          })
        } else {
          // we'll just replace the nodes that are different
          const paragraphNodes = root.getChildren()
          for (let i = 0; i < numParagraphNodes; i++) {
            const node = paragraphNodes[i]
            const paragraph = replacementNodes[i]
            node.replace(paragraph)
          }
        }

        // if (initialSelection) {
        //   const [start, end] = initialSelection
        //   const selection = $createRangeSelection();
        //   selection.anchor.set(start)
        //   $setSelection(new RangeSelection(start, end, 0, ''))
        // }
      }, { tag: 'collaboration' })
      setInitialized()
    }
  }, [initialText, editor, isInitialized, setInitialized, suggestions])

  return null
}

function splitBySuggestions(paragraph: string, paragraphStart: number, paragraphEnd: number, suggestions: AISuggestion[]) {
  const result: (TextNode | SuggestionDecoratorNode)[] = []

  // iterate through the suggestions, if the suggestion is in the paragraph, split the paragraph at the suggestion, push the current buffer as
  // a text node, and then push the suggestion as a suggestion decorator node


  // find all suggestions by fuzzy match
  const matchingSuggestions: [number, AISuggestion][] = []

  const remainingSuggestions = suggestions.filter((suggestion) => {
    const match = fuzzyMatch(paragraph, suggestion.original_text, suggestion.start_index)
    if (match !== -1) {
      matchingSuggestions.push([match, suggestion])
      return false
    } else {
      return true
    }
  })
  matchingSuggestions.sort((a, b) => a[0] - b[0])
  let lastIndex = 0;
  matchingSuggestions.forEach(([match, suggestion]) => {
    if (match < lastIndex) {
      console.log("overlapping suggestion", suggestion)
      return
    } else {
      result.push($createTextNode(paragraph.slice(lastIndex, match)))
      result.push($createSuggestionDecoratorNode(suggestion))
      lastIndex = match + suggestion.original_text.length
    }
  })
  if (lastIndex < paragraphEnd) {
    result.push($createTextNode(paragraph.slice(lastIndex, paragraphEnd)))
  }
  console.log("result", result, lastIndex, paragraph, paragraphStart, paragraphEnd)

  return {
    result,
    remainingSuggestions
  };
}

export function LexicalEditorComponent({
  initialText,
  needsSync,
  setSynced,
  onChange,
  onTextChange,
  suggestions,
  onSuggestionClick,
  selectedSuggestionId,
}: LexicalEditorProps) {
  function getWordCount(text: string | undefined) {
    return text === undefined ? 0 : text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length
  }

  const [wordCount, setWordCount] = useState(0)

  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [SuggestionDecoratorNode],
  }

  return (
    <div className="editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-inner">
          <div className="editor-content">
            <PlainTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div className="editor-placeholder">Start writing your document...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <TextInitializer initialText={initialText} isInitialized={!needsSync} setInitialized={setSynced} suggestions={suggestions} />
            <MyOnChangePlugin
              onChange={onChange}
              onTextChange={(text) => {
                setWordCount(getWordCount(text))
                onTextChange?.(text)
              }}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            {/* <SuggestionPlugin
              suggestions={suggestions}
            /> */}
          </div>
        </div>
        <div className="editor-word-count" style={{ textAlign: 'right', marginTop: '8px', color: '#888', fontSize: '14px' }}>
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </div>
      </LexicalComposer>
    </div>
  )
}

export const LexicalEditor = LexicalEditorComponent
