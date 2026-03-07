"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay z-200 backdrop-blur-md animate-in fade-in duration-fast"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content-md max-w-md p-8 space-y-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <h3 className="label-mono-small border-b border-base-border pb-2">
            {title}
          </h3>
          <p className="text-content-primary text-base font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-6 pt-4">
          <button
            onClick={onCancel}
            className="btn-base text-layer-medium hover:text-accent-2"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-base px-8 py-3 font-bold active:scale-95 ${
              variant === "danger"
                ? "bg-accent-2 text-white hover:bg-red-600"
                : "bg-content-primary text-base-bg hover:bg-content-secondary"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
