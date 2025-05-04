import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Check, Loader } from 'lucide-react';
import { FileService } from '../../services/fileService';
import { FileType } from '../../lib/file-service';

interface FileUploadButtonProps {
  onFileProcessed: (data: any) => void;
  allowedTypes?: FileType[];
  buttonText?: string;
  className?: string;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileProcessed,
  allowedTypes = [FileType.CSV, FileType.EXCEL],
  buttonText = 'Upload File',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await FileService.processFileUpload(file, allowedTypes);
      
      onFileProcessed(result.data);
      setSuccess(true);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      console.error('Error processing file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.map(type => {
          switch (type) {
            case FileType.CSV:
              return '.csv';
            case FileType.EXCEL:
              return '.xlsx,.xls';
            case FileType.PDF:
              return '.pdf';
            case FileType.JSON:
              return '.json';
            case FileType.XML:
              return '.xml';
            case FileType.TEXT:
              return '.txt';
            default:
              return '';
          }
        }).join(',')}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        className="btn btn-outline flex items-center"
        disabled={loading}
      >
        {loading ? (
          <Loader size={16} className="mr-2 animate-spin" />
        ) : success ? (
          <Check size={16} className="mr-2 text-success" />
        ) : (
          <Upload size={16} className="mr-2" />
        )}
        {loading ? 'Processing...' : success ? 'File Processed' : buttonText}
      </button>
      
      {error && (
        <div className="mt-2 flex items-start text-error text-sm">
          <AlertCircle size={16} className="mr-1 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mt-2 flex items-center text-success text-sm">
          <Check size={16} className="mr-1" />
          <span>File processed successfully</span>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Allowed file types: {allowedTypes.map(type => type.toString()).join(', ')}
      </div>
    </div>
  );
};

export default FileUploadButton;