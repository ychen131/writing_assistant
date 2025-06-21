/**
 * Floating Toolbar Component
 * 
 * A floating toolbar that appears on text selection with Persona and Engage buttons.
 * Used for the Persona feature to rewrite selected text and the Engage feature to add engagement suggestions.
 */

"use client"

import React from 'react'
import { Sparkles, ChevronDown, MessageCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

/**
 * Persona options available for text transformation
 */
const PERSONA_OPTIONS = [
  { value: 'Humorous', label: 'Humorous' },
  { value: 'Vivid', label: 'Vivid' },
  { value: 'To the point', label: 'To the point' },
] as const

/**
 * Props for the FloatingToolbar component
 */
interface FloatingToolbarProps {
  /**
   * Callback function called when a persona option is selected
   */
  onPersonaSelect: (persona: string) => void
  /**
   * Callback function called when the engage button is clicked
   */
  onEngage: () => void
  /**
   * Whether the persona feature is currently loading
   */
  isPersonaLoading: boolean
  /**
   * Whether the engage feature is currently loading
   */
  isEngageLoading: boolean
}

/**
 * Floating toolbar that appears on text selection
 */
export function FloatingToolbar({ 
  onPersonaSelect, 
  onEngage, 
  isPersonaLoading, 
  isEngageLoading 
}: FloatingToolbarProps) {
  /**
   * Handles persona selection from dropdown
   */
  const handlePersonaSelect = (persona: string) => {
    console.log('Selected Persona:', persona)
    onPersonaSelect(persona)
  }

  /**
   * Handles engage button click
   */
  const handleEngage = () => {
    console.log('Engage button clicked')
    onEngage()
  }

  return (
    <div className="flex items-center gap-1 bg-background border border-border rounded-md shadow-lg p-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-sm font-medium"
            disabled={isEngageLoading}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Persona
            <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {PERSONA_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handlePersonaSelect(option.value)}
              className="cursor-pointer"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-sm font-medium"
        onClick={handleEngage}
        disabled={isPersonaLoading}
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        Engage
      </Button>
    </div>
  )
} 