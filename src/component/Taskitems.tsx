import React from 'react';

interface TaskItemProps {
  description: string;
  details: string; // Add details prop
  points: number;
  completed: boolean;
  onClick: () => void;
  loading: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ description, details, points, completed, onClick, loading }) => {
  return (
    <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
      <div className="flex flex-col items-start">
        <span className="text-white mb-2 font-bold">{description}</span>
        <p className="text-gray-400 mb-2">{details}</p>
        <p className="text-gray-400">+ {points} TRL</p>
      </div>
      <button
        className={`bg-gradient-to-r from-green-400 to-blue-500 text-white py-1 px-4 rounded-lg font-semibold transition-all duration-300 hover:shadow-xl ${
          loading ? 'button-disabled' : completed ? 'done-button' : ''
        }`}
        onClick={onClick}
        disabled={loading || completed}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="loading-spinner mr-2"></div>
            Verifying...
          </div>
        ) : completed ? (
          <div className="flex items-center justify-center">
            Done
            <svg
              className="w-4 h-4 ml-2 done-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          'Start'
        )}
      </button>
    </div>
  );
};

export default TaskItem;
