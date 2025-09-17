import React from 'react';
import { useActivity } from '../../contexts/ActivityContext';

const ConnectionStatus = ({ channel, showText = true, size = 'sm', userList = [] }) => {
  const activity = useActivity();
  
  const status = activity.getConnectionStatus ? activity.getConnectionStatus(channel) : 'disconnected';
  
  // Calculate online count from specific user list if provided, otherwise use general count
  let onlineCount = 0;
  if (userList.length > 0) {
    const activityData = activity.getData(channel);
    onlineCount = userList.filter(user => {
      const activityInfo = activityData.find(activityItem => activityItem.user_id === user.id);
      if (activityInfo && activityInfo.last_active) {
        const timeDiff = Date.now() - new Date(activityInfo.last_active).getTime();
        return timeDiff <= 10000; // 10 seconds threshold
      }
      return false;
    }).length;
  } else {
    onlineCount = activity.getOnlineCount ? activity.getOnlineCount(channel) : 0;
  }
  
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          text: `Ulangan (${onlineCount} faol)`,
          icon: '●'
        };
      case 'connecting':
      case 'reconnecting':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500',
          text: 'Ulanmoqda...',
          icon: '◐'
        };
      case 'error':
      case 'failed':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          text: 'Ulanish xatosi',
          icon: '●'
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-500',
          text: 'Ulanmagan',
          icon: '●'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const dotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (!showText) {
    return (
      <div 
        className={`${dotSizes[size]} ${config.bgColor} rounded-full inline-block`}
        title={config.text}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      <div 
        className={`${dotSizes[size]} ${config.bgColor} rounded-full`}
        title={config.text}
      />
      <span className={config.color}>
        {config.text}
      </span>
    </div>
  );
};

export default ConnectionStatus;