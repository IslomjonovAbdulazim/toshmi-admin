import React from 'react';
import useWebSocket from '../../hooks/useWebSocket';

const WebSocketStatus = ({ showText = false, compact = true }) => {
  const { connectionState, isConnected, isConnecting, hasError } = useWebSocket();

  const getStatusColor = () => {
    if (isConnected) return '#10b981';
    if (isConnecting) return '#f59e0b';
    if (hasError) return '#ef4444';
    return '#6b7280';
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'OPEN': return 'Jonli aloqa';
      case 'CONNECTING': return 'Ulanmoqda...';
      case 'ERROR': return 'Xatolik';
      case 'FAILED': return 'Xatolik';
      case 'CLOSED': return 'Uzilgan';
      default: return 'Noma\'lum';
    }
  };

  const getStatusIcon = () => {
    if (isConnected) return '🟢';
    if (isConnecting) return '🟡';
    if (hasError) return '🔴';
    return '⚪';
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: compact ? '4px' : '8px',
      padding: compact ? '4px 8px' : '8px 12px',
      fontSize: compact ? '12px' : '14px',
      fontWeight: '500',
      color: getStatusColor(),
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: compact ? '6px' : '8px',
      border: `1px solid ${getStatusColor()}`,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    dot: {
      width: compact ? '6px' : '8px',
      height: compact ? '6px' : '8px',
      borderRadius: '50%',
      backgroundColor: getStatusColor(),
      animation: isConnecting ? 'pulse 1.5s ease-in-out infinite' : 'none'
    },
    text: {
      margin: 0,
      whiteSpace: 'nowrap'
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      <div 
        style={styles.container}
        title={`WebSocket holati: ${getStatusText()}`}
      >
        {compact ? (
          <>
            <div style={styles.dot}></div>
            {showText && <span style={styles.text}>Live</span>}
          </>
        ) : (
          <>
            <span>{getStatusIcon()}</span>
            <span style={styles.text}>{getStatusText()}</span>
          </>
        )}
      </div>
    </>
  );
};

export default WebSocketStatus;