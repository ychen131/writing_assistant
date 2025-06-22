/**
 * Floating Toolbar Plugin for Lexical Editor
 * 
 * Provides a floating toolbar that appears on text selection with Persona, Engage, and Smart Promo buttons.
 * Handles API calls and state management for text transformation features.
 */

"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { FloatingToolbar } from './floating-toolbar'
import { ProcessingModal } from './processing-modal'
import { toast } from 'sonner'
import type { AISuggestion } from '@/lib/types'

/**
 * Toolbar state interface
 */
interface ToolbarState {
  isVisible: boolean
  x: number
  y: number
}

/**
 * Props for the FloatingToolbarPlugin component
 */
interface FloatingToolbarPluginProps {
  onRewrite: (originalText: string, rewrittenText: string) => void;
  // Unified suggestions management
  onAddSuggestions?: (suggestions: AISuggestion[]) => void;
}

/**
 * Transform engagement API response to unified AISuggestion format
 */
function transformEngagementSuggestions(apiSuggestions: Array<{type: string, content: string}>): AISuggestion[] {
  return apiSuggestions.map((suggestion, index) => {
    // Map API types to our unified types
    let unifiedType: AISuggestion['type']
    switch (suggestion.type) {
      case 'Question':
        unifiedType = 'question'
        break
      case 'Call to Action':
        unifiedType = 'call-to-action'
        break
      case 'Interactive Prompt':
        unifiedType = 'interactive-prompt'
        break
      default:
        unifiedType = 'question' // fallback
    }

    return {
      id: Date.now() + index, // Generate unique ID
      type: unifiedType,
      original_text: '', // Engagement suggestions don't replace text
      suggested_text: suggestion.content,
      start_index: -1, // -1 indicates it should be appended to end
      end_index: -1,
      message: `Engagement suggestion: ${suggestion.content}`,
      status: 'proposed' as const
    }
  })
}

/**
 * Transform Smart Promo API response to unified AISuggestion format
 */
function transformSmartPromoSuggestions(apiSuggestions: Array<{strategy: string, rewrittenText: string, explanation: string}>, originalText: string, selection: any): AISuggestion[] {
  return apiSuggestions.map((suggestion, index) => {
    return {
      id: Date.now() + index, // Generate unique ID
      type: 'smart-promo',
      original_text: originalText,
      suggested_text: suggestion.rewrittenText,
      start_index: selection.anchor.offset,
      end_index: selection.focus.offset,
      message: 'Promotional Rewrite', // Use a static title to avoid duplication
      status: 'proposed' as const,
      strategy: suggestion.strategy,
      explanation: suggestion.explanation
    }
  })
}

export function FloatingToolbarPlugin({ onRewrite, onAddSuggestions }: FloatingToolbarPluginProps) {
  const [editor] = useLexicalComposerContext()
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    isVisible: false,
    x: 0,
    y: 0,
  })
  const [isPersonaProcessing, setIsPersonaProcessing] = useState(false)
  const [isEngageProcessing, setIsEngageProcessing] = useState(false)
  const [isSmartPromoProcessing, setIsSmartPromoProcessing] = useState(false)
  
  const personaAbortControllerRef = useRef<AbortController | null>(null)
  const engageAbortControllerRef = useRef<AbortController | null>(null)
  const smartPromoAbortControllerRef = useRef<AbortController | null>(null)

  /**
   * Check if the selected text represents the full document content
   */
  const isFullTextSelected = useCallback((selectedText: string) => {
    const fullText = editor.getEditorState().read(() => {
      return editor.getRootElement()?.textContent || ''
    })
    
    // A more aggressive normalization to remove all whitespace, including newlines.
    const normalize = (text: string) => text.replace(/\s/g, '');

    const normalizedSelected = normalize(selectedText);
    const normalizedFull = normalize(fullText);

    return normalizedSelected === normalizedFull
  }, [editor])

  const handlePersonaSelect = useCallback(async (persona: string) => {
    if (isPersonaProcessing || isEngageProcessing || isSmartPromoProcessing) return;

    // Get the selected text
    const selectedText = editor.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection) ? selection.getTextContent() : null;
    });

    if (!selectedText || selectedText.trim() === '') {
      toast.error("Please select some text to apply persona.");
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
  }, [editor, isPersonaProcessing, isEngageProcessing, isSmartPromoProcessing, onRewrite]);

  const handleEngage = useCallback(async () => {
    if (isPersonaProcessing || isEngageProcessing || isSmartPromoProcessing) return;

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

        // Transform engagement suggestions to unified format
        const unifiedSuggestions = transformEngagementSuggestions(suggestions);
        
        // Add the suggestions to the unified suggestions state
        if (onAddSuggestions) {
          onAddSuggestions(unifiedSuggestions);
        }

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
  }, [editor, isPersonaProcessing, isEngageProcessing, isSmartPromoProcessing, isFullTextSelected, onAddSuggestions]);

  const handleSmartPromo = useCallback(async () => {
    if (isPersonaProcessing || isEngageProcessing || isSmartPromoProcessing) return;

    // Get the selected text and selection
    const { selectedText, selection } = editor.getEditorState().read(() => {
      const selection = $getSelection();
      return {
        selectedText: $isRangeSelection(selection) ? selection.getTextContent() : null,
        selection: $isRangeSelection(selection) ? selection : null
      };
    });

    if (!selectedText || selectedText.trim() === '') {
      toast.error("Please select some text to generate Smart Promo suggestions.");
      return;
    }

    // Check if full text is selected
    if (!isFullTextSelected(selectedText)) {
      toast.error("Please select all text to use the Smart Promo feature.");
      return;
    }

    if (!selection) {
      toast.error("Invalid text selection.");
      return;
    }

    setIsSmartPromoProcessing(true)
    editor.setEditable(false)
    
    smartPromoAbortControllerRef.current = new AbortController()

    try {
        const response = await fetch('/api/promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: selectedText }),
            signal: smartPromoAbortControllerRef.current.signal,
        });

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const { suggestions } = await response.json();

        // Transform Smart Promo suggestions to unified format
        const unifiedSuggestions = transformSmartPromoSuggestions(suggestions, selectedText, selection);
        
        // Add the suggestions to the unified suggestions state
        if (onAddSuggestions) {
          onAddSuggestions(unifiedSuggestions);
        }

        toast.success("Smart Promo suggestions generated successfully!");

    } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            toast.error("Failed to generate Smart Promo suggestions. Please try again.");
            console.error(error);
        }
    } finally {
        setIsSmartPromoProcessing(false)
        editor.setEditable(true)
        smartPromoAbortControllerRef.current = null
    }
  }, [editor, isPersonaProcessing, isEngageProcessing, isSmartPromoProcessing, isFullTextSelected, onAddSuggestions]);

  const handleCancel = useCallback(() => {
    personaAbortControllerRef.current?.abort()
    engageAbortControllerRef.current?.abort()
    smartPromoAbortControllerRef.current?.abort()
    setIsPersonaProcessing(false)
    setIsEngageProcessing(false)
    setIsSmartPromoProcessing(false)
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
            onSmartPromo={handleSmartPromo}
            isPersonaLoading={isPersonaProcessing}
            isEngageLoading={isEngageProcessing}
            isSmartPromoLoading={isSmartPromoProcessing}
          />
        </div>,
        document.body
      )}
      <ProcessingModal isOpen={isPersonaProcessing || isEngageProcessing || isSmartPromoProcessing} onCancel={handleCancel} />
    </>
  )
} 