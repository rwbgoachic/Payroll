import React, { useState } from 'react';
import { Download, FileText, AlertCircle, Check, Loader } from 'lucide-react';
import { FileService } from '../../services/fileService';
import { FileType } from '../../lib/file-service';

interface FileDownloadButtonProps {
  data: any;
  fileName: string;
  fileType: FileType;
  buttonText?: string;
  className?: string;
}

const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({
  data,
  fileName,
  fileType,
  buttonText = 'Download',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await FileService.generateFileDownload(data, fileName, fileType);
      
      setSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate download');
      console.error('Error generating download:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleDownload}
        className="btn btn-outline flex items-center"
        disabled={loading}
      >
        {loading ? (
          <Loader size={16} className="mr-2 animate-spin" />
        ) : success ? (
          <Check size={16} className="mr-2 text-success" />
        ) : (
          <Download size={16} className="mr-2" />
        )}
        {loading ? 'Generating...' : success ? 'Downloaded' : buttonText}
      </button>
      
      {error && (
        <div className="mt-2 flex items-start text-error text-sm">
          <AlertCircle size={16} className="mr-1 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mt-2 flex items-center text-success text-sm" data-testid="download-status">
          <Check size={16} className="mr-1" />
          <span>Download started</span>
        </div>
      )}
    </div>
  );
};

export default FileDownloadButton;