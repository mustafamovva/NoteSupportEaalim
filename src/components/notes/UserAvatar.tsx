import React from 'react';

interface UserAvatarProps {
  name?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'blue-teal' | 'purple-pink';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  size = 'md',
  colorScheme = 'blue-teal'
}) => {
  // Get the initial from name or email
  const getInitial = () => {
    if (name) {
      return name.charAt(0).toUpperCase();
    } else if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Get display name for tooltip
  const displayName = name || (email ? email.split('@')[0] : 'Unknown');

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-md',
    lg: 'w-12 h-12 text-lg'
  };

  // Color scheme classes
  const colorClasses = {
    'blue-teal': {
      background: 'bg-gradient-to-r from-blue-500 to-teal-400',
      tooltipBg: 'bg-gradient-to-r from-blue-600 to-teal-500',
      tooltipArrow: 'bg-teal-500'
    },
    'purple-pink': {
      background: 'bg-gradient-to-r from-purple-500 to-pink-400',
      tooltipBg: 'bg-gradient-to-r from-purple-600 to-pink-500',
      tooltipArrow: 'bg-pink-500'
    }
  };

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} ${colorClasses[colorScheme].background} rounded-full flex items-center justify-center text-white font-medium`}>
        {getInitial()}
      </div>
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
        <div className={`w-2 h-2 ${colorClasses[colorScheme].tooltipArrow} transform rotate-45 absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-sm`}></div>
        <div className={`${colorClasses[colorScheme].tooltipBg} text-white text-xs rounded-md py-1.5 px-3 whitespace-nowrap shadow-lg border border-${colorScheme === 'blue-teal' ? 'blue' : 'purple'}-700/20`}>
          {displayName}
        </div>
      </div>
    </div>
  );
};

export default UserAvatar;