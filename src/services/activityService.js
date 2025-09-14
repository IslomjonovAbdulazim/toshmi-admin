import { API_BASE_URL } from '../utils/constants';

class ActivityService {
  constructor() {
    this.socket = null;
    this.listeners = {
      students: [],
      teachers: [],
      parents: []
    };
    this.reconnectInterval = null;
    this.maxReconnectAttempts = 10;
    this.reconnectAttempts = 0;
    this.connectionStatus = 'disconnected';
    this.heartbeatInterval = null;
    this.lastDataReceived = null;
    this.cachedData = {
      all: [],
      students: [],
      teachers: [],
      parents: []
    };
  }

  getWebSocketUrl() {
    const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    return `${wsUrl}/ws/activity`;
  }

  connect(channel, onMessage, onError = null, onOpen = null, onClose = null) {
    // If already connected, just add listener for this channel
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.addListener(channel, onMessage);
      if (onOpen) onOpen();
      // Send cached data if available
      if (this.cachedData[channel].length > 0) {
        onMessage({ type: `${channel.slice(0, -1)}_activity_update`, data: this.cachedData[channel] });
      }
      return this.socket;
    }

    // If connecting, just add listener
    if (this.connectionStatus === 'connecting') {
      this.addListener(channel, onMessage);
      return this.socket;
    }

    // Close existing connection if any
    if (this.socket) {
      this.disconnect();
    }

    this.connectionStatus = 'connecting';
    const wsUrl = this.getWebSocketUrl();
    console.log(`🔌 Connecting to activity endpoint: ${wsUrl}`);
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = (event) => {
        console.log(`✅ Connected to activity endpoint`);
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.lastDataReceived = Date.now();
        
        this.startHeartbeat();
        
        // Add the listener for this channel
        this.addListener(channel, onMessage);
        
        if (onOpen) onOpen(event);
      };

      socket.onmessage = (event) => {
        try {
          console.log('🔥 RAW WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          console.log('🔥 Parsed WebSocket data:', data);
          this.lastDataReceived = Date.now();
          
          if (data.type === 'pong') {
            console.log(`💓 Heartbeat response`);
            return;
          }
          
          // Cache all activity data (no role filtering since role field not in response)
          if (data.data && Array.isArray(data.data)) {
            console.log(`✅ Received ${data.data.length} activity records`);
            // Store all data - we'll filter on frontend based on user IDs
            this.cachedData.all = data.data;
            
            // For backward compatibility, notify all channel listeners with same data
            ['students', 'teachers', 'parents'].forEach(channel => {
              this.listeners[channel].forEach(listener => {
                try {
                  console.log(`📤 Notifying ${channel} listeners with ${data.data.length} records`);
                  listener({ 
                    type: `${channel.slice(0, -1)}_activity_update`, 
                    data: data.data,
                    timestamp: data.timestamp,
                    total_records: data.total_records
                  });
                } catch (err) {
                  console.error(`❌ Error in ${channel} listener:`, err);
                }
              });
            });
          } else {
            console.warn('⚠️ Received data but no data.data array:', data);
          }
        } catch (err) {
          console.error(`❌ Error parsing message:`, err, event.data);
        }
      };

      socket.onerror = (error) => {
        console.error(`❌ WebSocket error:`, error);
        this.connectionStatus = 'error';
        if (onError) onError(error);
      };

      socket.onclose = (event) => {
        console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
        this.connectionStatus = 'disconnected';
        this.socket = null;
        this.stopHeartbeat();
        
        if (onClose) onClose(event);
        
        // Auto-reconnect for unexpected closures
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(channel, onMessage, onError, onOpen, onClose);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error(`❌ Max reconnection attempts reached`);
          this.connectionStatus = 'failed';
        }
      };

      this.socket = socket;
      return socket;
    } catch (err) {
      console.error(`❌ Failed to create WebSocket:`, err);
      this.connectionStatus = 'error';
      if (onError) onError(err);
      return null;
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
        
        // Check if we haven't received data in a while
        const timeSinceLastData = Date.now() - this.lastDataReceived;
        if (timeSinceLastData > 90000) { // 1.5 minutes
          console.warn(`⚠️ No data received for ${timeSinceLastData}ms, connection may be stale`);
        }
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  scheduleReconnect(channel, onMessage, onError, onOpen, onClose) {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.connectionStatus = 'reconnecting';

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectInterval = setTimeout(() => {
      this.connect(channel, onMessage, onError, onOpen, onClose);
    }, delay);
  }

  disconnect(channel = null) {
    if (channel) {
      console.log(`🔌 Removing listeners for ${channel}`);
      this.listeners[channel] = [];
      this.cachedData[channel] = [];
      
      // Only disconnect socket if no other channels have listeners
      const hasOtherListeners = Object.values(this.listeners).some(listeners => listeners.length > 0);
      if (!hasOtherListeners && this.socket) {
        this._disconnectSocket();
      }
    } else {
      console.log(`🔌 Manually disconnecting from activity endpoint`);
      this._disconnectSocket();
    }
  }

  _disconnectSocket() {
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    
    this.stopHeartbeat();
    
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.reconnectAttempts = 0;
    this.connectionStatus = 'disconnected';
    this.lastDataReceived = null;
    
    // Clear all listeners and cached data
    Object.keys(this.listeners).forEach(key => {
      this.listeners[key] = [];
      this.cachedData[key] = [];
    });
  }

  addListener(channel, callback) {
    if (!this.listeners[channel].includes(callback)) {
      this.listeners[channel].push(callback);
    }
  }

  removeListener(channel, callback) {
    const index = this.listeners[channel].indexOf(callback);
    if (index > -1) {
      this.listeners[channel].splice(index, 1);
    }
  }

  isConnected(channel = null) {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(channel = null) {
    return this.connectionStatus;
  }

  getLastDataTime(channel = null) {
    return this.lastDataReceived;
  }

  getCachedData(channel) {
    // Return all data since we don't have role filtering from backend
    return this.cachedData.all || [];
  }

  disconnectAll() {
    console.log('🔌 Disconnecting all WebSocket connections');
    this._disconnectSocket();
  }

  getUserActivityStatus(lastActive) {
    if (!lastActive) {
      return { 
        isOnline: false, 
        statusText: 'Ma\'lumot topilmadi' 
      };
    }
    
    const now = new Date();
    
    // Parse lastActive as UTC timestamp (backend sends UTC time without 'Z')
    // The database timestamp is in UTC but doesn't have 'Z', so we add it
    const lastActiveUTC = lastActive.endsWith('Z') ? lastActive : lastActive + 'Z';
    const lastActiveDate = new Date(lastActiveUTC);
    
    const diffInSeconds = Math.floor((now - lastActiveDate) / 1000);
    
    // Debug logging (remove in production)
    console.log('Debug time calculation:', {
      now: now.toISOString(),
      lastActive: lastActive,
      lastActiveDate: lastActiveDate.toISOString(),
      diffInSeconds: diffInSeconds
    });
    
    // Online if active within 60 seconds
    if (diffInSeconds <= 60) {
      return { 
        isOnline: true, 
        statusText: 'Onlayn' 
      };
    }
    
    // If within 24 hours, show hours and minutes (or minutes and seconds)
    const diffInHours = Math.floor(diffInSeconds / 3600);
    if (diffInHours < 24) {
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      
      let timeText = '';
      
      // If less than 1 hour, show minutes and seconds
      if (hours === 0) {
        if (minutes > 0) {
          timeText += `${minutes} daqiqa `;
        }
        if (seconds > 0 || minutes === 0) {
          timeText += `${seconds} sekund `;
        }
      } else {
        // If 1+ hours, show hours and minutes
        timeText += `${hours} soat `;
        if (minutes > 0) {
          timeText += `${minutes} daqiqa `;
        }
      }
      
      return { 
        isOnline: false, 
        statusText: `${timeText.trim()} oldin` 
      };
    }
    
    // More than 24 hours, show date and time in local time
    const options = {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    const dateTimeString = lastActiveDate.toLocaleString('en-GB', options);
    
    return { 
      isOnline: false, 
      statusText: `${dateTimeString}` 
    };
  }
}

export const activityService = new ActivityService();