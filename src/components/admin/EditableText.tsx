"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ElementType,
} from "react";
import { toast } from "sonner";

export interface EditableBaseProps<K extends string> {
  field: K;
  initialValue: string;
  onSave: (field: K, newValue: string) => Promise<void>;
  isAdmin: boolean;
}

export function EditableText<K extends string>({
  as: Component = "div",
  field,
  initialValue,
  onSave,
  isAdmin,
  className = "",
  ...rest
}: EditableBaseProps<K> & {
  as?: ElementType;
  className?: string;
  [key: string]: any;
}) {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isEditing && !isSaving) {
      setCurrentValue(initialValue);
    }
  }, [initialValue, isEditing, isSaving]);

  const handleDoubleClick = useCallback(() => {
    if (!isAdmin || isSaving) return;
    setIsEditing(true);
    queueMicrotask(() => elementRef.current?.focus());
  }, [isAdmin, isSaving]);

  const handleBlur = useCallback(async () => {
    if (!isEditing) return;

    const newValue = elementRef.current?.textContent?.trim() || "";
    setIsEditing(false);

    if (newValue !== currentValue) {
      setIsSaving(true);
      try {
        await onSave(field, newValue);
        setCurrentValue(newValue);
      } catch (error) {
        console.error("Failed to save:", error);
        if (elementRef.current) elementRef.current.textContent = currentValue;
        toast.error("Failed to save. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  }, [isEditing, field, currentValue, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        elementRef.current?.blur();
      }
      if (e.key === "Escape") {
        setIsEditing(false);
        if (elementRef.current) elementRef.current.textContent = currentValue;
        elementRef.current?.blur();
      }
    },
    [currentValue]
  );

  const states = {
    admin: isAdmin
      ? "cursor-pointer hover:ring-1 hover:ring-layer-muted/30 transition-all"
      : "",
    editing: isEditing
      ? "outline-hidden ring-2 ring-accent-1 ring-offset-2 bg-base-bg z-10 relative"
      : "",
    saving: isSaving ? "opacity-50 cursor-wait" : "",
  };

  return (
    <Component
      ref={elementRef}
      contentEditable={isAdmin && isEditing}
      suppressContentEditableWarning={isAdmin}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      role={isAdmin ? "textbox" : undefined}
      aria-multiline="false"
      className={`${className} ${states.admin} ${states.editing} ${states.saving} leading-tight`}
      {...rest}
    >
      {currentValue}
    </Component>
  );
}
