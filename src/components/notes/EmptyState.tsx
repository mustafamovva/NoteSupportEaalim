import React from 'react'
import { PencilIcon } from "@heroicons/react/24/outline";
interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  className = ""
}) => {
  return (
    <div className={`flex flex-col justify-center items-center space-y-6 text-center w-full max-w-sm p-8 rounded-lg ${className}`}>
      <PencilIcon
        className='w-16 h-16 text-gray-400 dark:text-gray-500'
        aria-hidden="true"
      />
      <h3 className='text-2xl font-semibold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-300'>
        {title}
      </h3>
      <p className='text-gray-600 dark:text-gray-400'>
        {description}
      </p>
    </div>
  );
};

export default EmptyState


