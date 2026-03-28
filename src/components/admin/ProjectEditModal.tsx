"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FullProjectData, ProjectStatus } from "@/types";
import {
  mergeProjectAndDraft,
  getEditorStatus,
} from "@/services/utils/project-converter";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useProjectEditor } from "@/hooks/admin/useProjectEditor";
import { BasicInfoEditor } from "@/components/admin/BasicInfoEditor";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";

interface ProjectEditModalProps {
  initialProject: FullProjectData;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onCancelNew: (id: string) => Promise<void>;
  onProjectDataChange: () => void | Promise<void>;
}

export const ProjectEditModal = ({
  initialProject,
  onClose,
  onDelete,
  onCancelNew,
  onProjectDataChange,
}: ProjectEditModalProps) => {
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    mode: "publish" | "unpublish" | "delete" | null;
  }>({ isOpen: false, mode: null });

  const [hasSavedDuringSession, setHasSavedDuringSession] = useState(false);
  const [showSavedText, setShowSavedText] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setHasSavedDuringSession(false));
  }, [initialProject.id]);

  const baseData = useMemo(() => {
    return mergeProjectAndDraft(initialProject);
  }, [initialProject]);

  const {
    draftData,
    isUploading,
    previewUrl,
    isSlugValid,
    handleFieldChange,
    handleToggleTech,
    handleImageUpload,
    save,
  } = useProjectEditor(baseData);

  const isDirty = useMemo(
    () => JSON.stringify(draftData) !== JSON.stringify(baseData),
    [draftData, baseData]
  );

  /**
   * Firestore `draft` subdocument exists (Notes Save or "Save Draft" here wrote to FB).
   * For published projects, Publish must depend on this — not on local `isDirty` alone —
   * so Basic Info edits are not publishable until saved as draft; Notes flow stays:
   * Notes Save → FB draft → Publish enabled here.
   */
  const hasPersistedDraft = Boolean(
    initialProject.draft &&
      typeof initialProject.draft === "object" &&
      Object.keys(initialProject.draft).length > 0
  );

  const handleClose = useCallback(async () => {
    if (
      !hasSavedDuringSession &&
      !initialProject.slug &&
      !initialProject.published
    ) {
      await onCancelNew(initialProject.id);
      onProjectDataChange();
    }
    onClose();
  }, [
    hasSavedDuringSession,
    initialProject.slug,
    initialProject.published,
    onCancelNew,
    initialProject.id,
    onProjectDataChange,
    onClose,
  ]);

  const executeAction = useCallback(
    async (mode: "draft" | "publish" | "unpublish"): Promise<string | null> => {
      const result = await save(mode);
      if (!result.success) {
        toast.error(result.error.message);
        return null;
      }

      await onProjectDataChange();

      if (mode === "publish" || mode === "unpublish") {
        onClose();
      } else {
        setHasSavedDuringSession(true);
        setShowSavedText(true);
        setTimeout(() => setShowSavedText(false), 2000);
      }

      return draftData.slug;
    },
    [save, onProjectDataChange, onClose, draftData.slug]
  );

  const editorStatus: ProjectStatus = useMemo(() => {
    const isNew = !initialProject.slug && !initialProject.published;
    return getEditorStatus(draftData, isNew, hasSavedDuringSession);
  }, [
    draftData,
    initialProject.slug,
    initialProject.published,
    hasSavedDuringSession,
  ]);

  const statusDisplay = useMemo(() => {
    const config: Record<ProjectStatus, { label: string; className: string }> =
      {
        NewDraft: { label: "NEW", className: "text-accent-2" },
        DraftModified: { label: "Drafted", className: "text-accent-2" },
        Unpublished: { label: "Unpublished", className: "text-accent-2" },
        Published: { label: "Published", className: "text-accent-1" },
        Deleted: { label: "Deleted", className: "text-red-500" },
      };
    return (
      config[editorStatus] || {
        label: "Unknown",
        className: "text-layer-muted",
      }
    );
  }, [editorStatus]);

  return (
    <>
      <Modal
        onClose={handleClose}
        overlayClassName="z-100 animate-in fade-in duration-normal"
        panelClassName="text-content-primary max-h-[90dvh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-normal"
      >
          <header className="p-6 flex justify-between items-center bg-base-surface sticky top-0 z-20 border-b border-base-border/50">
            <div className="flex flex-col">
              <h2 className="text-sm-mono text-layer-medium truncate max-w-100">
                {!initialProject.slug && !initialProject.published
                  ? "Create New Project"
                  : `Editing / ${initialProject.title}`}
              </h2>
              <div className="flex gap-3 items-center mt-1 h-4 font-bold text-tiny uppercase tracking-widest">
                <span className={statusDisplay.className}>
                  {statusDisplay.label}
                </span>
                {editorStatus === "Published" && (
                  <>
                    <span className="text-layer-subtle">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmState({ isOpen: true, mode: "unpublish" })
                      }
                      className="text-xs-mono text-accent-2 px-2 py-0.5 border border-accent-2/50 hover:bg-accent-2/10 transition-all disabled:opacity-30"
                      disabled={isUploading}
                    >
                      Unpublish
                    </button>
                  </>
                )}
                {(isDirty || showSavedText) && (
                  <>
                    <span className="text-layer-subtle">|</span>
                    {isDirty ? (
                      <span className="text-layer-medium italic lowercase animate-pulse">
                        drafting...
                      </span>
                    ) : (
                      <span className="text-accent-1">Changes Saved</span>
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-layer-medium hover:text-content-primary text-3xl transition-colors"
            >
              &times;
            </button>
          </header>

          <main className="grow overflow-y-auto p-8 space-y-16 no-scrollbar bg-base-bg">
            <ErrorBoundary
              fallback={
                <div className="p-10 text-center text-accent-2">
                  Editor encounterd an error.
                </div>
              }
              resetKeys={[draftData.id]}
            >
              <BasicInfoEditor
                draftData={draftData}
                previewUrl={previewUrl}
                isSlugValid={isSlugValid}
                handleFieldChange={handleFieldChange}
                handleToggleTech={handleToggleTech}
                handleImageUpload={handleImageUpload}
                onNavigateToDetail={async () => {
                  const targetSlug = await executeAction("draft");
                  if (targetSlug)
                    router.push(`/projects/${targetSlug}?edit=true`);
                }}
              />
            </ErrorBoundary>
          </main>

          <footer className="p-6 flex justify-end gap-4 border-t border-base-border bg-layer-faint/30">
            <button
              onClick={() => setConfirmState({ isOpen: true, mode: "delete" })}
              className="text-xs-mono text-accent-2 px-4 py-2 hover:bg-accent-2/5 transition-all disabled:opacity-30"
              disabled={
                (!initialProject.slug && !initialProject.published) ||
                isUploading
              }
            >
              [ Delete ]
            </button>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleClose}
                className="text-sm-mono px-4 py-2 hover:text-accent-2 transition-colors"
              >
                {hasSavedDuringSession ? "Close" : "Cancel"}
              </button>
              <Button
                variant="outline"
                onClick={() => executeAction("draft")}
                className="text-accent-1 px-4 py-2"
                disabled={isUploading || !isDirty || !isSlugValid}
              >
                Save Draft
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setConfirmState({ isOpen: true, mode: "publish" })
                }
                className="font-bold bg-content-primary text-base-bg px-8 py-2.5 disabled:opacity-30"
                disabled={
                  isUploading ||
                  !isSlugValid ||
                  (draftData.published && !hasPersistedDraft)
                }
              >
                Publish Now
              </Button>
            </div>
          </footer>
      </Modal>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={
          confirmState.mode === "delete"
            ? "Confirm Deletion"
            : confirmState.mode === "unpublish"
              ? "Confirm Unpublish"
              : "Confirm Publication"
        }
        message={
          confirmState.mode === "delete"
            ? "This action will permanently delete the project draft."
            : confirmState.mode === "unpublish"
              ? "This project will be hidden from the public. You can publish again anytime."
              : "Ready to make this project public?"
        }
        confirmLabel={
          confirmState.mode === "delete"
            ? "Delete Now"
            : confirmState.mode === "unpublish"
              ? "Unpublish"
              : "Publish Now"
        }
        variant={confirmState.mode === "delete" ? "danger" : "primary"}
        onConfirm={async () => {
          const { mode } = confirmState;
          setConfirmState({ isOpen: false, mode: null });
          if (mode === "publish") await executeAction("publish");
          else if (mode === "unpublish") await executeAction("unpublish");
          else if (mode === "delete") {
            await onDelete(initialProject.id);
            onProjectDataChange();
            onClose();
          }
        }}
        onCancel={() => setConfirmState({ isOpen: false, mode: null })}
      />
    </>
  );
};
