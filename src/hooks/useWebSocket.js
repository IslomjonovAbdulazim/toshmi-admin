import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';

class ToshmiWebSocket {
  constructor(url, onActivityData, onConnectionChange) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 1000;
    this.maxReconnectInterval = 30000;
    this.pingInterval = null;
    this.pongTimeout = null;
    this.isConnecting = false;
    this.onActivityData = onActivityData;
    this.onConnectionChange = onConnectionChange;
    
    this.connect();
  }

  connect() {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    console.log('🔌 Connecting to WebSocket...');
    this.onConnectionChange?.('CONNECTING');
    
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectInterval = 1000;
      this.onConnectionChange?.('OPEN');
      this.startPingPong();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'pong') {
          this.handlePong(data);
          return;
        }
        
        this.handleActivityData(data);
        
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('❌ WebSocket disconnected');
      this.isConnecting = false;
      this.onConnectionChange?.('CLOSED');
      this.stopPingPong();
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.isConnecting = false;
      this.onConnectionChange?.('ERROR');
    };
  }

  startPingPong() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendPing();
      }
    }, 30000);
  }

  stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  sendPing() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
      
      this.pongTimeout = setTimeout(() => {
        console.warn('⚠️ No pong received, closing connection');
        this.ws?.close();
      }, 10000);
    }
  }

  handlePong(data) {
    console.log('🏓 Received pong:', data.timestamp);
    
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  handleActivityData(data) {
    console.log('📊 Activity update:', {
      timestamp: data.timestamp,
      total_records: data.total_records,
      users: data.data?.length || 0
    });
    
    this.onActivityData?.(data);
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚫 Max reconnection attempts reached');
      this.onConnectionChange?.('FAILED');
      return;
    }

    console.log(`🔄 Scheduling reconnect in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectInterval = Math.min(
        this.reconnectInterval * 2, 
        this.maxReconnectInterval
      );
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    this.stopPingPong();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onConnectionChange?.('DISCONNECTED');
  }

  getConnectionState() {
    if (!this.ws) return 'DISCONNECTED';
    
    const states = {
      0: 'CONNECTING',
      1: 'OPEN',
      2: 'CLOSING', 
      3: 'CLOSED'
    };
    
    return states[this.ws.readyState] || 'UNKNOWN';
  }
}

const useWebSocket = () => {
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [activityData, setActivityData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const wsRef = useRef(null);

  const handleActivityData = useCallback((data) => {
    setActivityData(data.data || []);
    setLastUpdate(data.timestamp);
    setTotalRecords(data.total_records || 0);
  }, []);

  const handleConnectionChange = useCallback((state) => {
    setConnectionState(state);
  }, []);

  useEffect(() => {
    const wsUrl = API_BASE_URL.replace('https://', 'wss://') + '/ws/activity';
    
    const ws = new ToshmiWebSocket(
      wsUrl,
      handleActivityData,
      handleConnectionChange
    );
    
    wsRef.current = ws;

    return () => {
      ws.disconnect();
    };
  }, [handleActivityData, handleConnectionChange]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      wsRef.current?.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    connectionState,
    activityData,
    lastUpdate,
    totalRecords,
    isConnected: connectionState === 'OPEN',
    isConnecting: connectionState === 'CONNECTING',
    hasError: ['ERROR', 'FAILED'].includes(connectionState)
  };
};

export default useWebSocket;