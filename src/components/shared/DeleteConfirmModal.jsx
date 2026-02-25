import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this memory?",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Warning Icon */}
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isDanger ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}
            >
              <FiAlertTriangle className="h-8 w-8" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-stone-900">{title}</h3>
            <p className="mb-8 text-stone-600 leading-relaxed">{message}</p>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={onClose}
                className="order-2 w-full rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-all sm:order-1 sm:w-auto"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`order-1 w-full rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-95 sm:order-2 sm:w-auto ${
                  isDanger
                    ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                    : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
