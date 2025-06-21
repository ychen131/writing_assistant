/**
 * Processing Modal Component
 *
 * Displays a modal window with a loading animation and a cancel option
 * when a long-running AI task is in progress.
 */
"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ProcessingModalProps {
  isOpen: boolean
  onCancel: () => void
}

/**
 * A simple pulsing dots animation component.
 */
function PulsingDots() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
    </div>
  )
}

export function ProcessingModal({ isOpen, onCancel }: ProcessingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <PulsingDots />
          </div>
          <DialogTitle className="text-xl">Thinking and Writing...</DialogTitle>
          <DialogDescription>
            Transforming your text with AI. This shouldn't take long.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 