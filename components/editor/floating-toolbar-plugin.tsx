/**
 * Floating Toolbar Plugin
 * 
 * A Lexical plugin that manages the visibility and positioning of the floating toolbar
 * based on text selection in the editor.
 */

"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, type RangeSelection } from 'lexical'
import { createPortal } from 'react-dom'
import { toast } from "sonner"
import { FloatingToolbar } from './floating-toolbar'
import { ProcessingModal } from './processing-modal'

/**
 * Position and visibility state for the floating toolbar
 */
interface ToolbarState {
  isVisible: boolean
  x: number
  y: number
}

interface FloatingToolbarPluginProps {
  onRewrite: (originalText: string, rewrittenText: string) => void;
}

/**
 * Lexical plugin that manages floating toolbar visibility and positioning
 */
export function FloatingToolbarPlugin({ onRewrite }: FloatingToolbarPluginProps) {
  const [editor] = useLexicalComposerContext()
  
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    isVisible: false,
    x: 0,
    y: 0,
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handlePersonaSelect = useCallback(async (persona: string) => {
    if (isProcessing) return;

    // First, synchronously get the text from within a read block.
    const selectedText = editor.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection) ? selection.getTextContent() : null;
    });

    if (!selectedText || selectedText.trim() === '') {
      // Don't proceed if there's no text.
      return;
    }

    setIsProcessing(true)
    editor.setEditable(false)
    
    abortControllerRef.current = new AbortController()

    try {
        const response = await fetch('/api/persona', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: selectedText, persona }),
            signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const { rewrittenText } = await response.json();

        onRewrite(selectedText, rewrittenText);

        toast.success("Persona applied successfully!");

    } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            toast.error(`Failed to apply ${persona} persona. Please try again.`);
            console.error(error);
        }
    } finally {
        setIsProcessing(false)
        editor.setEditable(true)
        abortControllerRef.current = null
    }
  }, [editor, isProcessing, onRewrite]);

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsProcessing(false)
    editor.setEditable(true)
  }, [editor]);

  const updateToolbarPosition = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || selection.isCollapsed() || editor.getRootElement() === null) {
        setToolbarState((prev) => ({ ...prev, isVisible: false }));
        return;
      }

      const nativeSelection = window.getSelection();
      if (!nativeSelection?.rangeCount) {
        setToolbarState((prev) => ({ ...prev, isVisible: false }));
        return;
      }
      
      const domRange = nativeSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      // Position toolbar above the selection
      const toolbarHeight = 44; // Approximate height of the toolbar + margin
      const offset = 5; // Distance from the selection
      
      setToolbarState({
        isVisible: true,
        x: rect.left + (rect.width / 2), // Center horizontally
        y: rect.top - toolbarHeight + offset, // Position above selection
      });
    });
  }, [editor])

  const hideToolbar = useCallback(() => {
    setToolbarState(prev => ({ ...prev, isVisible: false }))
  }, [])

  useEffect(() => {
    // Register update listener to track selection changes
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          updateToolbarPosition()
        } else {
          hideToolbar()
        }
      })
    })

    // Hide toolbar on scroll, which doesn't always trigger a selection change
    const handleScroll = () => {
      hideToolbar()
    }
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      removeUpdateListener()
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [editor, updateToolbarPosition, hideToolbar])

  return (
    <>
      {toolbarState.isVisible && createPortal(
        <div
          className="floating-toolbar fixed z-50"
          style={{
            left: `${toolbarState.x}px`,
            top: `${toolbarState.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <FloatingToolbar onPersonaSelect={handlePersonaSelect} />
        </div>,
        document.body
      )}
      <ProcessingModal isOpen={isProcessing} onCancel={handleCancel} />
    </>
  )
} 