import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Check, Loader, Info } from 'lucide-react';
import { FileService } from '../../services/fileService';
import { FileType } from '../../lib/file-service';
import FileUploadButton from './FileUploadButton';

interface ImportPayrollDataProps {
  onDataImported: (data: any[]) => void;
  className?: string;
}

const ImportPayrollData: React.FC<ImportPayrollDataProps> = ({
  onDataImported,
  className = ''
}) => {
  const [data, setData] = useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileProcessed = (fileData: any[]) => {
    setData(fileData);
    
    // Validate the data
    const validationResult = validatePayrollData(fileData);
    setValidationErrors(validationResult.errors);
    
    if (validationResult.isValid) {
      onDataImported(fileData);
      setSuccess(true);
    }
  };

  const validatePayrollData = (data: any[]): { isValid: boolean; errors: any[] } => {
    const errors: any[] = [];
    
    // Check if data is an array
    if (!Array.isArray(data)) {
      errors.push({
        message: 'Imported data is not in the expected format'
      });
      return { isValid: false, errors };
    }
    
    // Check if data is empty
    if (data.length === 0) {
      errors.push({
        message: 'No data found in the imported file'
      });
      return { isValid: false, errors };
    }
    
    // Check required fields
    const requiredFields = ['employeeId', 'hours', 'date'];
    
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] && row[field] !== 0) {
          errors.push({
            row: index + 1,
            field,
            message: `Missing required field: ${field}`
          });
        }
      });
      
      // Validate hours is a number
      if (row.hours && isNaN(Number(row.hours))) {
        errors.push({
          row: index + 1,
          field: 'hours',
          message: 'Hours must be a number'
        });
      }
      
      // Validate date format
      if (row.date && isNaN(Date.parse(row.date))) {
        errors.push({
          row: index + 1,
          field: 'date',
          message: 'Invalid date format'
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Import Payroll Data</h3>
      
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <Info size={16} className="text-primary mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-700">File Format Requirements:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>CSV or Excel file with headers</li>
              <li>Required columns: employeeId, hours, date</li>
              <li>Date format: YYYY-MM-DD</li>
              <li>Hours must be numeric values</li>
            </ul>
          </div>
        </div>
      </div>
      
      <FileUploadButton
        onFileProcessed={handleFileProcessed}
        allowedTypes={[FileType.CSV, FileType.EXCEL]}
        buttonText="Import Payroll Data"
      />
      
      {validationErrors.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-error mb-2">Validation Errors:</h4>
          <div className="bg-error/5 border border-error/20 rounded-lg p-3 max-h-40 overflow-y-auto">
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>
                  {error.row ? `Row ${error.row}: ` : ''}
                  {error.field ? `Field "${error.field}" - ` : ''}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {data && validationErrors.length === 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-success mb-2">Data Preview:</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, valueIndex) => (
                      <td key={valueIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <div className="text-center text-xs text-gray-500 mt-2">
                Showing 5 of {data.length} rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPayrollData;