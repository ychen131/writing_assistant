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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"

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
  /** The content to display inside the modal */
  children: React.ReactNode
  /** Optional footer content, typically for buttons */
  footer?: React.ReactNode
  /** Optional CSS classes to apply to the dialog content */
  className?: string
  /** A boolean to indicate if the title should be visually hidden */
  hideTitle?: boolean
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
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-h-[90vh] flex flex-col", className)}>
        {title ? (
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        ) : (
          <VisuallyHidden>
            <DialogTitle>Modal</DialogTitle>
          </VisuallyHidden>
        )}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">{children}</div>
        {footer && (
          <DialogFooter className="flex-shrink-0 pt-4 border-t -mx-6 px-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
} 