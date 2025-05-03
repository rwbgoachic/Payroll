import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface SyncStatusProps {
  className?: string;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ className = '' }) => {
  const { status, lastSync, sync } = useSyncStatus();
  const isOnline = useOnlineStatus();

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    
    // If less than a minute ago, show "Just now"
    const diffMs = Date.now() - lastSync.getTime();
    if (diffMs < 60000) return 'Just now';
    
    // If less than an hour ago, show minutes
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise, show time
    return lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff size={16} className="text-error" />;
    
    switch (status) {
      case 'syncing':
        return <RefreshCw size={16} className="text-primary animate-spin" />;
      case 'success':
        return <CheckCircle size={16} className="text-success" />;
      case 'error':
        return <AlertCircle size={16} className="text-error" />;
      default:
        return <Wifi size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return `Synced: ${formatLastSync()}`;
      case 'error':
        return 'Sync failed';
      default:
        return 'Idle';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        {getStatusIcon()}
        <span className="ml-1 text-xs">{getStatusText()}</span>
      </div>
      
      {isOnline && status !== 'syncing' && (
        <button
          onClick={() => sync()}
          className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
          title="Sync now"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
};

export default SyncStatus;