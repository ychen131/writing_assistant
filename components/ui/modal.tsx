/**
 * Reusable Modal component built on shadcn/ui Dialog
 * 
 * This component provides a consistent modal interface across the application
 * with proper accessibility and styling.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

/**
 * Props for the Modal component
 */
interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to call when the modal should close */
  onClose: () => void
  /** The title displayed in the modal header */
  title?: string
  /** Optional description text */
  description?: string
  /** Whether to hide the title visually (still accessible to screen readers) */
  hideTitle?: boolean
  /** The content to display inside the modal */
  children: React.ReactNode
  /** Optional CSS classes to apply to the dialog content */
  className?: string
}

/**
 * Reusable Modal component
 * 
 * @param props - The modal props
 * @returns A modal dialog component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  hideTitle = false,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && (
              hideTitle ? (
                <VisuallyHidden>
                  <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
              ) : (
                <DialogTitle>{title}</DialogTitle>
              )
            )}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
} 