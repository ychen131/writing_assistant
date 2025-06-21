"use client"
import { $getRoot, $createTextNode, $createParagraphNode, type EditorState, ParagraphNode } from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import React, { useState, useEffect } from "react"

import { addSuggestions, removeSuggestions, } from "@/lib/suggestions"
import type { AISuggestion } from "@/lib/types"
import { SuggestionDecoratorNode } from "./suggestions-decorator"
import { FloatingToolbarPlugin } from "./floating-toolbar-plugin"

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

  const [processedSuggestions, setProcessedSuggestions] = useState<Set<AISuggestion>>(new Set<AISuggestion>());

  useEffect(() => {
    // if we're not initialized, we'll refresh the entire view
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

        let paragraphTextOffset = 0;
        let remainingSuggestions = suggestions;
        initialText.split('\n\n').forEach((paragraph) => {
          const paragraphNode = $createParagraphNode()
          const textNode = $createTextNode(paragraph)
          paragraphNode.append(textNode)
          remainingSuggestions = addSuggestions(paragraphNode, remainingSuggestions, paragraphTextOffset)
          paragraphTextOffset += paragraph.length + 2 // add two for the "\n\n"
          root.append(paragraphNode)
        })

        suggestions.forEach((suggestion) => {
          processedSuggestions.add(suggestion)
        })
        setProcessedSuggestions(processedSuggestions)
      })
      setInitialized()
    } else {

      const newSuggestions = new Set<AISuggestion>();
      suggestions.forEach((suggestion) => {
        newSuggestions.add(suggestion)
      })

      const addedSuggestions = newSuggestions.difference(processedSuggestions)
      const removedSuggestions = processedSuggestions.difference(newSuggestions)

      if (addedSuggestions.size > 0 || removedSuggestions.size > 0) {
        queueMicrotask(() => {
          editor.update(() => {
            console.log("suggestions added/remove -- updating", addedSuggestions, removedSuggestions)
            const root = $getRoot()
            let paragraphTextOffset = 0;
            let remainingSuggestions = suggestions;
            root.getChildren().forEach(node => {
              if (node instanceof ParagraphNode) {
                removeSuggestions(node)
                remainingSuggestions = addSuggestions(node, remainingSuggestions, paragraphTextOffset)
                paragraphTextOffset += node.getTextContent().length + 2;
              }
            })
            setProcessedSuggestions(newSuggestions)
          }, { discrete: true });
        });
      }
    }
  }, [initialText, editor, isInitialized, setInitialized, suggestions, processedSuggestions, setProcessedSuggestions])

  return null
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
            <FloatingToolbarPlugin />
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
