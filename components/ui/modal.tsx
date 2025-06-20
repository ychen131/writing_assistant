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

/**
 * Props for the Modal component
 */
interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function to call when the modal should close */
  onClose: () => void
  /** The title displayed in the modal header */
  title: string
  /** Optional description text */
  description?: string
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
  children,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
} 