import React from "react";
import { createRoot } from "react-dom/client";
import DeleteConfirmModal from "./DeleteConfirmModal";

/**
 * Show a centered confirmation dialog with Delete and Cancel buttons
 * @param {string} message - The confirmation message to display
 * @param {string} title - The title of the modal
 * @param {string} confirmText - Text for confirm button (default: "Delete")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @returns {Promise<boolean>} - Returns true if confirmed, false if cancelled
 */
export const confirmDelete = (
  message = "Are you sure you want to delete this memory?",
  title = "Confirm Delete",
  confirmText = "Delete",
  cancelText = "Cancel",
) => {
  return new Promise((resolve) => {
    // Create a container for the modal
    const container = document.createElement("div");
    container.id = "confirm-modal-container";
    document.body.appendChild(container);

    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    root.render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
      />,
    );
  });
};

export default confirmDelete;
