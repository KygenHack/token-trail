// Notification.tsx
import React from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white text-black p-4 rounded-lg shadow-xl transform scale-100 transition-transform duration-500 ease-in-out">
        <h2 className="text-2xl font-bold mb-4">🎉 Congratulations! 🎉</h2>
        <p className="text-center">{message}</p>
       <center>
       <button
         className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          onClick={onClose}
        >
          Close
        </button>
       </center>
      </div>
    </div>
  );
};

export default Notification;
