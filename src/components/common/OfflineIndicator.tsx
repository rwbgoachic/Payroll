import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-error text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50">
      <WifiOff size={16} className="mr-2" />
      <span>You are offline. Changes will be synced when you reconnect.</span>
    </div>
  );
};

export default OfflineIndicator;