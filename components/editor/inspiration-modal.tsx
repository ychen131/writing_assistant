/**
 * Inspiration Modal component for the "I Need Inspiration" feature
 * 
 * This component manages the complete flow for helping users get writing inspiration,
 * from the initial decision to displaying AI-generated angles.
 */

"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Loader2 } from "lucide-react"

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
 * Mock data for development and testing
 */
const MOCK_ANGLES: InspirationAngle[] = [
  {
    angle_type: 'Personal Anecdote',
    content: 'I remember the first time I encountered this topic. It was one of those moments that completely shifted my perspective. The experience taught me something unexpected about myself and the world around me. Looking back now, I realize how that simple encounter became a turning point in my journey.'
  },
  {
    angle_type: 'Informative/Tips',
    content: 'When it comes to this topic, there\'s one crucial tip that most people overlook: start small and build gradually. Many beginners make the mistake of diving in too deep too quickly, which often leads to overwhelm and burnout. The key is to establish a solid foundation first, then expand your horizons step by step.'
  },
  {
    angle_type: 'Descriptive/Sensory',
    content: 'The atmosphere around this topic is almost palpable - you can feel the energy in the air, hear the subtle sounds that create the perfect backdrop, and see the way light plays across surfaces. Every detail contributes to an experience that engages all your senses and leaves you with lasting memories.'
  }
]

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
   * Handles submitting the topic and starting the loading process
   */
  const handleSubmitTopic = () => {
    if (!topic.trim()) return
    
    setCurrentView('loading')
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      setAngles(MOCK_ANGLES)
      setCurrentView('display_angles')
    }, 2000)
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
   * Handles the "Rethink" action to generate new angles
   */
  const handleRethink = () => {
    setCurrentView('loading')
    
    // Simulate new API call
    setTimeout(() => {
      // Generate slightly different mock data
      const newAngles: InspirationAngle[] = [
        {
          angle_type: 'Personal Anecdote',
          content: 'Another perspective on this topic came to me during a quiet moment of reflection. It reminded me of how sometimes the most profound insights come when we least expect them. This experience shaped my understanding in ways I never anticipated.'
        },
        {
          angle_type: 'Informative/Tips',
          content: 'A different approach to this topic involves focusing on the fundamentals. The most successful people in this area often share one common trait: they prioritize consistency over perfection. Small, daily actions compound into remarkable results over time.'
        },
        {
          angle_type: 'Descriptive/Sensory',
          content: 'Imagine stepping into a space where this topic comes alive. The textures, the sounds, the subtle aromas all work together to create an immersive experience. Every element has been carefully considered to transport you to a different state of mind.'
        }
      ]
      setAngles(newAngles)
      setCurrentView('display_angles')
    }, 2000)
  }

  /**
   * Handles selecting an angle and closing the modal
   */
  const handleSelectAngle = (angle: InspirationAngle) => {
    // TODO: In Part 3, this will navigate to editor with pre-filled content
    console.log('Selected angle:', angle)
    onClose()
    resetModal()
  }

  /**
   * Handles retry from error state
   */
  const handleRetry = () => {
    setCurrentView('loading')
    setErrorMessage('')
    
    // Simulate retry
    setTimeout(() => {
      setAngles(MOCK_ANGLES)
      setCurrentView('display_angles')
    }, 2000)
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

      <div className="mx-auto max-w-md space-y-3">
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
   * Renders the topic input view
   */
  const renderTopicInputView = () => (
    <div className="space-y-6">
      <div className="space-y-4">
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
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleBackToDecision}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmitTopic}
          disabled={!topic.trim()}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  )

  /**
   * Renders the loading view
   */
  const renderLoadingView = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
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
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200 flex flex-col"
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

      <div className="flex gap-3">
        <Button
          onClick={handleBackToTopic}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleRethink}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Rethink
        </Button>
      </div>
    </div>
  )

  /**
   * Renders the error view
   */
  const renderErrorView = () => (
    <div className="space-y-6 text-center">
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

      <div className="flex gap-3">
        <Button
          onClick={handleBackToTopic}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="sm:max-w-3xl"
    >
      {renderCurrentView()}
    </Modal>
  )
} 