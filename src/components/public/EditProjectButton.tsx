"use client";

import { FiEdit3 } from "react-icons/fi";

export const EditProjectButton = ({
  slug,
  onEdit,
}: {
  slug: string;
  onEdit: (slug: string) => void;
}) => (
  <button
    onClick={() => onEdit(slug)}
    className="absolute top-2 right-2 lg:top-4 lg:right-4 z-30 p-2 bg-base-bg/80 backdrop-blur-md border border-base-border text-content-primary rounded-sm hover:bg-content-primary hover:text-base-bg transition-all duration-fast"
    aria-label="Edit project"
  >
    <FiEdit3 className="w-4 h-4" />
  </button>
);
