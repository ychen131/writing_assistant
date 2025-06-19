"use client"
import { $getRoot, $createTextNode, $createParagraphNode, type EditorState } from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import React, { useState, useEffect } from "react"

import { SuggestionDecoratorNode, SuggestionPlugin } from "./suggestion-plugin"
import type { AISuggestion } from "@/lib/types"

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
}

function TextInitializer({ initialText, isInitialized, setInitialized }: TextInitializerProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (initialText && !isInitialized) {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        
        // Split text into paragraphs and create paragraph nodes with text nodes
        const paragraphs = initialText.split('\n')
        paragraphs.forEach((paragraph, index) => {
          if (paragraph.trim() || index === 0) {
            const paragraphNode = $createParagraphNode()
            const textNode = $createTextNode(paragraph)
            paragraphNode.append(textNode)
            root.append(paragraphNode)
          }
        })
      })
      setInitialized()
    }
  }, [initialText, editor, isInitialized, setInitialized])

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
            <TextInitializer initialText={initialText} isInitialized={!needsSync} setInitialized={setSynced} />
            <MyOnChangePlugin
              onChange={onChange}
              onTextChange={(text) => {
                setWordCount(getWordCount(text))
                onTextChange?.(text)
              }}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <SuggestionPlugin
              suggestions={suggestions}
            />
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
