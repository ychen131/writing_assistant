/**
 * Floating Toolbar Plugin
 * 
 * A Lexical plugin that manages the visibility and positioning of the floating toolbar
 * based on text selection in the editor. Supports both Persona and Engage features.
 */

"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, $getRoot, type RangeSelection } from 'lexical'
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

  const [isPersonaProcessing, setIsPersonaProcessing] = useState(false)
  const [isEngageProcessing, setIsEngageProcessing] = useState(false)
  const personaAbortControllerRef = useRef<AbortController | null>(null)
  const engageAbortControllerRef = useRef<AbortController | null>(null)

  /**
   * Checks if the selected text represents the full document content
   * Allows for minor differences (whitespace, newlines)
   */
  const isFullTextSelected = useCallback((selectedText: string): boolean => {
    const fullText = editor.getEditorState().read(() => {
      const root = $getRoot()
      return root.getTextContent()
    })

    // Normalize both texts by trimming whitespace and normalizing newlines
    const normalizedSelected = selectedText.trim().replace(/\r\n/g, '\n')
    const normalizedFull = fullText.trim().replace(/\r\n/g, '\n')

    // Allow for minor differences (up to 5% length difference)
    const lengthDiff = Math.abs(normalizedSelected.length - normalizedFull.length)
    const maxAllowedDiff = Math.max(normalizedFull.length * 0.05, 10) // 5% or 10 chars, whichever is larger

    return lengthDiff <= maxAllowedDiff
  }, [editor])

  const handlePersonaSelect = useCallback(async (persona: string) => {
    if (isPersonaProcessing || isEngageProcessing) return;

    // First, synchronously get the text from within a read block.
    const selectedText = editor.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection) ? selection.getTextContent() : null;
    });

    if (!selectedText || selectedText.trim() === '') {
      // Don't proceed if there's no text.
      return;
    }

    setIsPersonaProcessing(true)
    editor.setEditable(false)
    
    personaAbortControllerRef.current = new AbortController()

    try {
        const response = await fetch('/api/persona', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: selectedText, persona }),
            signal: personaAbortControllerRef.current.signal,
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
        setIsPersonaProcessing(false)
        editor.setEditable(true)
        personaAbortControllerRef.current = null
    }
  }, [editor, isPersonaProcessing, isEngageProcessing, onRewrite]);

  const handleEngage = useCallback(async () => {
    if (isPersonaProcessing || isEngageProcessing) return;

    // Get the selected text
    const selectedText = editor.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection) ? selection.getTextContent() : null;
    });

    if (!selectedText || selectedText.trim() === '') {
      toast.error("Please select some text to generate engagement suggestions.");
      return;
    }

    // Check if full text is selected
    if (!isFullTextSelected(selectedText)) {
      toast.error("Please select all text to use the Engage feature.");
      return;
    }

    setIsEngageProcessing(true)
    editor.setEditable(false)
    
    engageAbortControllerRef.current = new AbortController()

    try {
        const response = await fetch('/api/engage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: selectedText }),
            signal: engageAbortControllerRef.current.signal,
        });

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const { suggestions } = await response.json();

        // For now, just log the suggestions
        // TODO: In Prompt 2.2, we'll create the engagement suggestion components
        console.log('Engagement suggestions received:', suggestions);

        toast.success("Engagement suggestions generated successfully!");

    } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            toast.error("Failed to generate engagement suggestions. Please try again.");
            console.error(error);
        }
    } finally {
        setIsEngageProcessing(false)
        editor.setEditable(true)
        engageAbortControllerRef.current = null
    }
  }, [editor, isPersonaProcessing, isEngageProcessing, isFullTextSelected]);

  const handleCancel = useCallback(() => {
    personaAbortControllerRef.current?.abort()
    engageAbortControllerRef.current?.abort()
    setIsPersonaProcessing(false)
    setIsEngageProcessing(false)
    editor.setEditable(true)
  }, [editor]);

  const updateToolbarPosition = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || selection.isCollapsed() || editor.getRootElement() === null) {
        setToolbarState((prev) => ({ ...prev, isVisible: false }));
        return;
      }

      const selectedText = selection.getTextContent();
      
      // Only show toolbar if full text is selected
      if (!isFullTextSelected(selectedText)) {
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
  }, [editor, isFullTextSelected])

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
          <FloatingToolbar 
            onPersonaSelect={handlePersonaSelect} 
            onEngage={handleEngage}
            isPersonaLoading={isPersonaProcessing}
            isEngageLoading={isEngageProcessing}
          />
        </div>,
        document.body
      )}
      <ProcessingModal isOpen={isPersonaProcessing || isEngageProcessing} onCancel={handleCancel} />
    </>
  )
} 