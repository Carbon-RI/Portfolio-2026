import { twMerge } from "tailwind-merge";

const OVERLAY_BASE =
  "fixed inset-0 bg-base-bg flex items-center justify-center p-4 z-50";

const PANEL_BASE =
  "bg-base-surface border border-base-border w-full max-w-5xl";

interface ModalProps {
  onClose: () => void;
  overlayClassName?: string;
  panelClassName?: string;
  children: React.ReactNode;
}

export function Modal({
  onClose,
  overlayClassName = "",
  panelClassName = "",
  children,
}: ModalProps) {
  return (
    <div
      className={twMerge(OVERLAY_BASE, overlayClassName)}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={twMerge(PANEL_BASE, panelClassName)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
