// Notification.tsx
import React from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showConfirm?: boolean;
  warningMessage?: string;
  deductPoints?: () => void;
}

const TaskConfirmation: React.FC<NotificationProps> = ({ message, onClose, onConfirm, showConfirm, warningMessage, deductPoints }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white text-black p-4 rounded-lg shadow-xl transform scale-100 transition-transform duration-500 ease-in-out">
        <h2 className="text-2xl font-bold mb-4">🎉 Congratulations! 🎉</h2>
        <p className="text-center">{message}</p>
        {warningMessage && <p className="text-center text-red-500 mt-2">{warningMessage}</p>}
        <div className="mt-4 flex justify-center">
          {showConfirm ? (
            <>
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 mr-2"
                onClick={onConfirm}
              >
                Yes
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                onClick={deductPoints}
              >
                No
              </button>
            </>
          ) : (
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskConfirmation;
