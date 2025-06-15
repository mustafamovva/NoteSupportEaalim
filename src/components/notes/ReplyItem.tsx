import React from 'react';
import UserAvatar from './UserAvatar';

// Define Reply interface locally for this component
interface Reply {
  id: string;
  noteId: string;
  content: string;
  createdAt: Date;
  creatorEmail: string;
  creatorName: string;
}

interface ReplyItemProps {
  reply: Reply;
  onDeleteReply: (replyId: string) => void;
  formatDate: (date: Date) => string;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, onDeleteReply, formatDate }) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <UserAvatar
          name={reply.creatorName}
          email={reply.creatorEmail}
          size="sm"
          colorScheme="purple-pink"
        />
      </div>
      <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 overflow-hidden relative group/reply">
        <div className="absolute right-2 top-2 opacity-0 group-hover/reply:opacity-100 transition-opacity">
          <button
            onClick={() => onDeleteReply(reply.id)}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="Delete reply"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words w-full overflow-wrap-anywhere pr-6">
          {reply.content}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDate(reply.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ReplyItem;