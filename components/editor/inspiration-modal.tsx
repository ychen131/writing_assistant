/**
 * Inspiration Modal component for the "I Need Inspiration" feature
 * 
 * This component manages the complete flow for helping users get writing inspiration,
 * from the initial decision to displaying AI-generated angles.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Loader2 } from "lucide-react"

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
  // Hooks
  const router = useRouter()
  const supabase = createClient()

  // State management
  const [currentView, setCurrentView] = useState<ModalView>('decision')
  const [topic, setTopic] = useState('')
  const [angles, setAngles] = useState<InspirationAngle[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Fetches inspiration angles from the API
   */
  const fetchInspiration = async () => {
    if (!topic.trim()) return

    setIsSubmitting(true)
    setCurrentView('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/inspire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate inspiration')
      }

      const data = await response.json()
      setAngles(data.angles)
      setCurrentView('display_angles')
    } catch (error) {
      console.error('Error fetching inspiration:', error)
      const message = error instanceof Error ? error.message : 'An unknown error occurred.'
      setErrorMessage(message)
      setCurrentView('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handles submitting the topic, rethinking, and retrying
   */
  const handleSubmitTopic = () => fetchInspiration()
  const handleRethink = () => fetchInspiration()
  const handleRetry = () => fetchInspiration()

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
   * Handles going back from topic input to decision
   */
  const handleBackToDecision = () => {
    setCurrentView('decision')
    setTopic('')
  }

  /**
   * Handles going back from display angles to topic input
   */
  const handleBackToTopic = () => {
    setCurrentView('input_topic')
  }

  /**
   * Creates a new document with the selected angle content and navigates to the editor
   */
  const handleSelectAngle = async (angle: InspirationAngle) => {
    setIsSubmitting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Authentication failed. Please sign in again.")

      const { data: newDocument, error } = await supabase
        .from("documents")
        .insert([{ 
          title: topic || "Untitled Inspired Document",
          user_id: user.id,
          plain_text_content: angle.content
        }])
        .select()
        .single()

      if (error) throw error

      onClose()
      resetModal()
      router.push(`/editor/${newDocument.id}`)
    } catch (error) {
      console.error("Error creating document from angle:", error)
      const message = error instanceof Error ? error.message : 'An unknown error occurred.'
      setErrorMessage(message)
      setCurrentView('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Resets the modal to its initial state
   */
  const resetModal = () => {
    setCurrentView('decision')
    setTopic('')
    setAngles([])
    setErrorMessage('')
    setIsSubmitting(false)
  }

  /**
   * Handles closing the modal
   */
  const handleClose = () => {
    onClose()
    resetModal()
  }

  // --- VIEW RENDER FUNCTIONS ---

  /**
   * Renders the initial decision view
   */
  const renderDecisionView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-green-600" />
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

      <div className="mx-auto max-w-md space-y-3">
        <Button
          onClick={handleGetInspiration}
          className="w-full justify-start h-12 text-left"
          variant="outline"
          disabled={isSubmitting}
        >
          <Sparkles className="h-5 w-5 mr-3 text-green-600" />
          <div>
            <div className="font-medium">I need inspiration</div>
            <div className="text-sm text-gray-500">Get AI-generated ideas</div>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>

        <Button
          onClick={handleContinueWithoutInspiration}
          className="w-full justify-start h-12 text-left"
          variant="outline"
          disabled={isSubmitting}
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
   * Renders the topic input view
   */
  const renderTopicInputView = () => (
    <div className="space-y-4 pt-2">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          What's on your mind?
        </h3>
        <p className="text-gray-600 mt-1">
          Describe your topic in a sentence or two. We'll generate three creative angles to help you get started.
        </p>
      </div>

      <Textarea
        value={topic}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTopic(e.target.value)}
        placeholder="e.g., cooking pasta, traveling to Japan, starting a morning routine..."
        className="min-h-[100px] resize-none"
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmitTopic()
          }
        }}
        autoFocus
        disabled={isSubmitting}
      />
    </div>
  )

  /**
   * Renders the loading view
   */
  const renderLoadingView = () => (
    <div className="space-y-6 text-center py-10">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Generating ideas...
        </h3>
        <p className="text-gray-600 mt-1">
          Our AI is crafting three unique angles for your topic.
        </p>
      </div>
    </div>
  )

  /**
   * Renders the display angles view
   */
  const renderDisplayAnglesView = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Here are three ways to approach your topic:
        </h3>
        <p className="text-gray-600">Select one to start writing</p>
      </div>

      <div className="space-y-4">
        {angles.map((angle, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200 flex flex-col"
            onClick={() => handleSelectAngle(angle)}
          >
            <CardContent className="p-6 flex-1">
              <p className="text-gray-700 leading-relaxed">
                {angle.content}
              </p>
            </CardContent>
            <div className="px-6 pb-4 pt-2">
              <p className="text-sm text-gray-400">{angle.angle_type}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  /**
   * Renders the error view
   */
  const renderErrorView = () => (
    <div className="space-y-6 text-center py-10">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Something went wrong
        </h3>
        <p className="text-gray-600 mt-1">
          {errorMessage || 'We couldn\'t generate inspiration angles. Please try again.'}
        </p>
      </div>
    </div>
  )

  // --- FOOTER RENDER FUNCTIONS ---

  const renderTopicInputFooter = () => (
    <div className="flex w-full gap-3">
      <Button
        onClick={handleBackToDecision}
        variant="outline"
        className="flex items-center gap-2"
        disabled={isSubmitting}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button
        onClick={handleSubmitTopic}
        disabled={!topic.trim() || isSubmitting}
        className="ml-auto"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue
      </Button>
    </div>
  )

  const renderDisplayAnglesFooter = () => (
    <div className="flex w-full gap-3">
       <Button
        onClick={handleBackToTopic}
        variant="outline"
        className="flex items-center gap-2"
        disabled={isSubmitting}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button
        onClick={handleRethink}
        variant="outline"
        className="flex items-center gap-2 ml-auto"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Rethink
      </Button>
    </div>
  )

  const renderErrorFooter = () => (
    <div className="flex w-full gap-3">
      <Button
        onClick={handleBackToTopic}
        variant="outline"
        className="flex items-center gap-2"
        disabled={isSubmitting}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button
        onClick={handleRetry}
        className="flex items-center gap-2 ml-auto"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Retry
      </Button>
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
        return renderTopicInputView()
      case 'loading':
        return renderLoadingView()
      case 'display_angles':
        return renderDisplayAnglesView()
      case 'error':
        return renderErrorView()
      default:
        return renderDecisionView()
    }
  }

  /**
   * Renders the appropriate footer based on current state
   */
  const renderCurrentFooter = () => {
    // No footer on loading and decision screens
    if (currentView === 'loading' || currentView === 'decision') return null;
    
    switch (currentView) {
      case 'input_topic':
        return renderTopicInputFooter()
      case 'display_angles':
        return renderDisplayAnglesFooter()
      case 'error':
        return renderErrorFooter()
      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="sm:max-w-2xl"
      footer={renderCurrentFooter()}
    >
      {renderCurrentView()}
    </Modal>
  )
}