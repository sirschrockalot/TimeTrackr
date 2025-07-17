import React from "react";
import Modal from "../shared/Modal";
import { AlertTriangle, Trash2, XCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 size={24} className="text-[#EF4444]" />;
      case "warning":
        return <AlertTriangle size={24} className="text-[#F59E0B]" />;
      case "info":
        return <XCircle size={24} className="text-[#4E9CF5]" />;
      default:
        return <AlertTriangle size={24} className="text-[#EF4444]" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case "danger":
        return "bg-[#EF4444] hover:bg-[#DC2626] text-white";
      case "warning":
        return "bg-[#F59E0B] hover:bg-[#D97706] text-white";
      case "info":
        return "bg-[#4E9CF5] hover:bg-[#3E8BE0] text-white";
      default:
        return "bg-[#EF4444] hover:bg-[#DC2626] text-white";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#242435] mb-4">
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#F3F3F5] mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-[#C2C2CC] mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-[#F3F3F5] bg-[#2A2A3A] border border-[#3E3E50] rounded-md hover:bg-[#3E3E50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonStyle()}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal; 