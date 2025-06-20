/**
 * Inspiration Modal component for the "I Need Inspiration" feature
 * 
 * This component manages the complete flow for helping users get writing inspiration,
 * from the initial decision to displaying AI-generated angles.
 */

"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowRight } from "lucide-react"

/**
 * Type definition for inspiration angles
 */
interface InspirationAngle {
  angle_type: 'Personal Anecdote' | 'Informative/Tips' | 'Descriptive/Sensory'
  content: string
}

/**
 * Type definition for the modal view states
 */
type ModalView = 'decision' | 'input_topic' | 'loading' | 'display_angles' | 'error'

/**
 * Props for the InspirationModal component
 */
interface InspirationModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to call when the modal should close */
  onClose: () => void
  /** Function to call when user wants to continue without inspiration */
  onContinue: () => void
}

/**
 * Inspiration Modal component
 * 
 * @param props - The modal props
 * @returns The inspiration modal component
 */
export function InspirationModal({
  isOpen,
  onClose,
  onContinue,
}: InspirationModalProps) {
  // State management
  const [currentView, setCurrentView] = useState<ModalView>('decision')
  const [topic, setTopic] = useState('')
  const [angles, setAngles] = useState<InspirationAngle[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * Handles the initial decision to get inspiration
   */
  const handleGetInspiration = () => {
    setCurrentView('input_topic')
  }

  /**
   * Handles continuing without inspiration
   */
  const handleContinueWithoutInspiration = () => {
    onContinue()
    resetModal()
  }

  /**
   * Resets the modal to its initial state
   */
  const resetModal = () => {
    setCurrentView('decision')
    setTopic('')
    setAngles([])
    setErrorMessage('')
  }

  /**
   * Handles closing the modal
   */
  const handleClose = () => {
    onClose()
    resetModal()
  }

  /**
   * Renders the initial decision view
   */
  const renderDecisionView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Lightbulb className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            How would you like to start?
          </h3>
          <p className="text-gray-600 mt-1">
            Choose whether you need inspiration or want to start with a blank canvas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleGetInspiration}
          className="w-full justify-start h-12 text-left"
          variant="outline"
        >
          <Lightbulb className="h-5 w-5 mr-3 text-blue-600" />
          <div>
            <div className="font-medium">I need inspiration</div>
            <div className="text-sm text-gray-500">Get AI-generated writing angles</div>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>

        <Button
          onClick={handleContinueWithoutInspiration}
          className="w-full justify-start h-12 text-left"
          variant="outline"
        >
          <ArrowRight className="h-5 w-5 mr-3 text-gray-600" />
          <div>
            <div className="font-medium">Continue</div>
            <div className="text-sm text-gray-500">Start with a blank document</div>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>
      </div>
    </div>
  )

  /**
   * Renders the appropriate view based on current state
   */
  const renderCurrentView = () => {
    switch (currentView) {
      case 'decision':
        return renderDecisionView()
      case 'input_topic':
        return <div>Topic input view (coming next)</div>
      case 'loading':
        return <div>Loading view (coming next)</div>
      case 'display_angles':
        return <div>Display angles view (coming next)</div>
      case 'error':
        return <div>Error view (coming next)</div>
      default:
        return renderDecisionView()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Document"
      description="Start your writing journey"
      className="sm:max-w-md"
    >
      {renderCurrentView()}
    </Modal>
  )
} 