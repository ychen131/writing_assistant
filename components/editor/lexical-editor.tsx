"use client"
import { $getRoot, type EditorState } from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import React, { useState } from "react"

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
  initialContent?: string
  onChange?: (editorState: EditorState) => void
  onTextChange?: (text: string) => void
  suggestions?: AISuggestion[]
  setSuggestions?: (suggestions: AISuggestion[]) => void
  onSuggestionClick?: (id: string) => void
  selectedSuggestionId?: string | null
  setApplyingSuggestions?: (isApplyingSuggestions: boolean) => void
}

function MyOnChangePlugin({
  onChange,
  onTextChange,
}: { onChange?: (editorState: EditorState) => void; onTextChange?: (text: string) => void }) {
  const [editor] = useLexicalComposerContext()

  return (
    <OnChangePlugin
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

export function LexicalEditorComponent({
  initialContent,
  onChange,
  onTextChange,
  suggestions = [],
  setSuggestions,
  setApplyingSuggestions,
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
    nodes: [
      SuggestionDecoratorNode
    ],
    editorState: initialContent,
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
              setSuggestions={setSuggestions || (() => {})}
              setIsApplyingSuggestions={setApplyingSuggestions}
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
