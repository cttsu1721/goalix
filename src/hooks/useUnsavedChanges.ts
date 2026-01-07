import { useState, useCallback, useEffect } from "react";

interface UseUnsavedChangesOptions {
  /** Initial state - whether there are unsaved changes */
  initialHasChanges?: boolean;
  /** Callback when user tries to close with unsaved changes */
  onUnsavedClose?: () => void;
}

interface UseUnsavedChangesReturn {
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Mark that changes have been made */
  setHasChanges: (hasChanges: boolean) => void;
  /** Mark as changed (shorthand for setHasChanges(true)) */
  markChanged: () => void;
  /** Mark as saved/reset (shorthand for setHasChanges(false)) */
  markSaved: () => void;
  /** Check if it's safe to close (no changes, or user confirmed) */
  canClose: () => boolean;
  /** Handler to wrap onOpenChange for dialogs */
  handleOpenChange: (open: boolean, originalHandler: (open: boolean) => void) => void;
}

/**
 * Hook to track unsaved changes in forms/modals
 *
 * Usage:
 * ```tsx
 * const { hasChanges, markChanged, handleOpenChange } = useUnsavedChanges();
 *
 * // Track changes
 * <Input onChange={(e) => { setValue(e.target.value); markChanged(); }} />
 *
 * // Wrap dialog close handler
 * <Dialog onOpenChange={(open) => handleOpenChange(open, onOpenChange)} />
 * ```
 */
export function useUnsavedChanges(
  options: UseUnsavedChangesOptions = {}
): UseUnsavedChangesReturn {
  const { initialHasChanges = false, onUnsavedClose } = options;
  const [hasChanges, setHasChanges] = useState(initialHasChanges);

  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const markSaved = useCallback(() => {
    setHasChanges(false);
  }, []);

  const canClose = useCallback(() => {
    if (!hasChanges) return true;

    // Show confirmation dialog
    const confirmed = window.confirm(
      "You have unsaved changes. Are you sure you want to close?"
    );

    if (confirmed) {
      onUnsavedClose?.();
      return true;
    }

    return false;
  }, [hasChanges, onUnsavedClose]);

  const handleOpenChange = useCallback(
    (open: boolean, originalHandler: (open: boolean) => void) => {
      // If closing (open = false), check for unsaved changes
      if (!open) {
        if (canClose()) {
          setHasChanges(false); // Reset state
          originalHandler(open);
        }
        // If canClose returns false, don't call originalHandler
      } else {
        // Opening - just pass through
        originalHandler(open);
      }
    },
    [canClose]
  );

  // Warn on page navigation with unsaved changes
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages, but we need to set returnValue
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  return {
    hasChanges,
    setHasChanges,
    markChanged,
    markSaved,
    canClose,
    handleOpenChange,
  };
}
