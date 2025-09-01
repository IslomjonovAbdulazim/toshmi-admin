import { API_BASE_URL } from '../utils/constants';

class ActivityService {
  constructor() {
    this.sockets = {
      students: null,
      teachers: null,
      parents: null
    };
    this.listeners = {
      students: [],
      teachers: [],
      parents: []
    };
    this.reconnectIntervals = {};
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = {
      students: 0,
      teachers: 0,
      parents: 0
    };
  }

  getWebSocketUrl(channel) {
    const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    return `${wsUrl}/ws/${channel}`;
  }

  connect(channel, onMessage, onError = null, onOpen = null, onClose = null) {
    if (this.sockets[channel]) {
      this.disconnect(channel);
    }

    const wsUrl = this.getWebSocketUrl(channel);
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = (event) => {
        console.log(`Connected to ${channel} activity channel`);
        this.reconnectAttempts[channel] = 0;
        if (onOpen) onOpen(event);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
          
          this.listeners[channel].forEach(listener => {
            try {
              listener(data);
            } catch (err) {
              console.error(`Error in ${channel} listener:`, err);
            }
          });
        } catch (err) {
          console.error(`Error parsing ${channel} message:`, err);
        }
      };

      socket.onerror = (error) => {
        console.error(`${channel} WebSocket error:`, error);
        if (onError) onError(error);
      };

      socket.onclose = (event) => {
        console.log(`${channel} WebSocket closed:`, event.code, event.reason);
        this.sockets[channel] = null;
        
        if (onClose) onClose(event);
        
        if (event.code !== 1000 && this.reconnectAttempts[channel] < this.maxReconnectAttempts) {
          this.scheduleReconnect(channel, onMessage, onError, onOpen, onClose);
        }
      };

      this.sockets[channel] = socket;
      return socket;
    } catch (err) {
      console.error(`Failed to create ${channel} WebSocket:`, err);
      if (onError) onError(err);
      return null;
    }
  }

  scheduleReconnect(channel, onMessage, onError, onOpen, onClose) {
    if (this.reconnectIntervals[channel]) {
      clearTimeout(this.reconnectIntervals[channel]);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts[channel]), 30000);
    this.reconnectAttempts[channel]++;

    console.log(`Reconnecting to ${channel} in ${delay}ms (attempt ${this.reconnectAttempts[channel]})`);

    this.reconnectIntervals[channel] = setTimeout(() => {
      this.connect(channel, onMessage, onError, onOpen, onClose);
    }, delay);
  }

  disconnect(channel) {
    if (this.sockets[channel]) {
      this.sockets[channel].close(1000, 'Manual disconnect');
      this.sockets[channel] = null;
    }
    
    if (this.reconnectIntervals[channel]) {
      clearTimeout(this.reconnectIntervals[channel]);
      delete this.reconnectIntervals[channel];
    }
    
    this.reconnectAttempts[channel] = 0;
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

  isConnected(channel) {
    return this.sockets[channel]?.readyState === WebSocket.OPEN;
  }

  disconnectAll() {
    Object.keys(this.sockets).forEach(channel => {
      this.disconnect(channel);
    });
  }

  getUserActivityStatus(lastActive) {
    if (!lastActive) return { isOnline: false, statusText: 'Hech qachon faol bo\'lmagan' };
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInSeconds = (now - lastActiveDate) / 1000;
    
    if (diffInSeconds <= 30) {
      return { isOnline: true, statusText: 'Onlayn' };
    }
    
    if (diffInSeconds < 60) {
      return { isOnline: false, statusText: `${Math.floor(diffInSeconds)} soniya oldin` };
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return { isOnline: false, statusText: `${minutes} daqiqa oldin` };
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return { isOnline: false, statusText: `${hours} soat oldin` };
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return { isOnline: false, statusText: `${days} kun oldin` };
    }
  }
}

export const activityService = new ActivityService();