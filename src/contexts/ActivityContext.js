import React, { createContext, useContext, useState, useEffect } from 'react';
import { activityService } from '../services/activityService';

const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const [onlineCounts, setOnlineCounts] = useState({
    students: 0,
    teachers: 0,
    parents: 0
  });

  // Update online counts whenever data changes
  const updateOnlineCounts = () => {
    const allData = activityService.getCachedData('all');

    const onlineUsers = allData.filter(item => 
      activityService.getUserActivityStatus(item.last_active).isOnline
    ).length;

    // Since we don't have role separation, we'll show total online count for all channels
    // Individual pages will filter by their own user lists
    setOnlineCounts({
      students: onlineUsers,
      teachers: onlineUsers,
      parents: onlineUsers
    });
  };

  const connect = (channel) => {
    activityService.connect(
      channel,
      (data) => {
        // Data is automatically cached in the service, just update counts
        updateOnlineCounts();
      },
      (error) => {
        console.error(`Activity connection error for ${channel}:`, error);
      },
      () => {
        console.log(`Connected to ${channel} activity`);
        updateOnlineCounts();
      },
      () => {
        console.log(`Disconnected from ${channel} activity`);
      }
    );
  };

  const disconnect = (channel) => {
    activityService.disconnect(channel);
    updateOnlineCounts();
  };

  const reconnect = (channel) => {
    disconnect(channel);
    setTimeout(() => connect(channel), 1000);
  };

  const value = {
    connect,
    disconnect,
    reconnect,
    isConnected: (channel) => activityService.isConnected(channel),
    getConnectionStatus: (channel) => activityService.getConnectionStatus(channel),
    getOnlineCount: (channel) => onlineCounts[channel] || 0,
    getData: (channel) => activityService.getCachedData(channel)
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}