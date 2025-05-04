import { scanFile, scanStream } from '../services/file-upload/scanner';
import { parseCSV, parseCSVString, formatToCSV, saveToCSV } from '../services/file-upload/csv-parser';
import * as ExcelJS from 'exceljs';

// Supported file types
export enum FileType {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json',
  XML = 'xml',
  TEXT = 'text',
  UNKNOWN = 'unknown'
}

/**
 * Determine file type from file extension
 * @param filename Filename with extension
 * @returns FileType enum value
 */
export function getFileType(filename: string): FileType {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'csv':
      return FileType.CSV;
    case 'xls':
    case 'xlsx':
      return FileType.EXCEL;
    case 'pdf':
      return FileType.PDF;
    case 'json':
      return FileType.JSON;
    case 'xml':
      return FileType.XML;
    case 'txt':
    case 'text':
      return FileType.TEXT;
    default:
      return FileType.UNKNOWN;
  }
}

/**
 * Process a file based on its type
 * @param filePath Path to the file
 * @returns Processed data
 */
export async function processFile(filePath: string): Promise<any> {
  try {
    // Scan file for security
    const scanResult = await scanFile(filePath);
    
    if (scanResult.isInfected || !scanResult.isAllowedType || !scanResult.isAllowedSize) {
      throw new Error(scanResult.error || 'File scan failed');
    }
    
    // Get file type
    const fs = await import('fs/promises');
    const fileStats = await fs.stat(filePath);
    const fileType = getFileType(filePath);
    
    // Process based on file type
    switch (fileType) {
      case FileType.CSV:
        return await parseCSV(filePath);
      
      case FileType.EXCEL:
        return await parseExcel(filePath);
      
      case FileType.JSON:
        const jsonContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(jsonContent);
      
      case FileType.XML:
        const xmlContent = await fs.readFile(filePath, 'utf8');
        // Simple XML parsing - in a real app, use a proper XML parser
        return { content: xmlContent, type: 'xml' };
      
      case FileType.TEXT:
        return await fs.readFile(filePath, 'utf8');
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

/**
 * Parse Excel file to JSON
 * @param filePath Path to the Excel file
 * @returns Parsed data as array of objects
 */
export async function parseExcel(filePath: string): Promise<any[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1); // Get first worksheet
    
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }
    
    const data: any[] = [];
    const headers: string[] = [];
    
    // Extract headers from first row
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
    });
    
    // Process data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData: Record<string, any> = {};
      
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        rowData[header] = cell.value;
      });
      
      data.push(rowData);
    });
    
    return data;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
}

/**
 * Convert Excel file to CSV
 * @param excelFilePath Path to the Excel file
 * @param csvFilePath Path to save the CSV file
 * @returns Path to the saved CSV file
 */
export async function convertExcelToCSV(excelFilePath: string, csvFilePath: string): Promise<string> {
  try {
    // Parse Excel file
    const data = await parseExcel(excelFilePath);
    
    // Save as CSV
    return await saveToCSV(data, csvFilePath);
  } catch (error) {
    console.error('Error converting Excel to CSV:', error);
    throw error;
  }
}

/**
 * Save data to Excel file
 * @param data Array of objects to save
 * @param filePath Path to save the Excel file
 * @returns Path to the saved file
 */
export async function saveToExcel(data: any[], filePath: string): Promise<string> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    
    if (data.length === 0) {
      throw new Error('No data to save');
    }
    
    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => item[header]);
      worksheet.addRow(row);
    });
    
    // Save workbook
    await workbook.xlsx.writeFile(filePath);
    
    return filePath;
  } catch (error) {
    console.error('Error saving to Excel file:', error);
    throw error;
  }
}

/**
 * Process a file upload
 * @param file File object from form upload
 * @param allowedTypes Array of allowed file types
 * @returns Processed file data
 */
export async function processFileUpload(
  file: File,
  allowedTypes: FileType[] = [FileType.CSV, FileType.EXCEL]
): Promise<{
  data: any;
  fileType: FileType;
  fileName: string;
  fileSize: number;
}> {
  try {
    const fileType = getFileType(file.name);
    
    // Check if file type is allowed
    if (!allowedTypes.includes(fileType)) {
      throw new Error(`File type ${fileType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds maximum allowed size of 50MB');
    }
    
    // Process file based on type
    let data: any;
    
    switch (fileType) {
      case FileType.CSV:
        const csvText = await file.text();
        data = parseCSVString(csvText);
        break;
      
      case FileType.EXCEL:
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          throw new Error('No worksheet found in Excel file');
        }
        
        data = [];
        const headers: string[] = [];
        
        // Extract headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
        });
        
        // Process data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData: Record<string, any> = {};
          
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            rowData[header] = cell.value;
          });
          
          data.push(rowData);
        });
        break;
      
      case FileType.JSON:
        const jsonText = await file.text();
        data = JSON.parse(jsonText);
        break;
      
      case FileType.TEXT:
        data = await file.text();
        break;
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    return {
      data,
      fileType,
      fileName: file.name,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error processing file upload:', error);
    throw error;
  }
}

/**
 * Generate a file download
 * @param data Data to include in the file
 * @param fileName Name for the download file
 * @param fileType Type of file to generate
 * @returns Blob URL for download
 */
export async function generateFileDownload(
  data: any,
  fileName: string,
  fileType: FileType
): Promise<string> {
  try {
    let blob: Blob;
    let mimeType: string;
    
    switch (fileType) {
      case FileType.CSV:
        const csvString = formatToCSV(data);
        blob = new Blob([csvString], { type: 'text/csv' });
        mimeType = 'text/csv';
        break;
      
      case FileType.EXCEL:
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        
        // Add headers
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);
        
        // Add data rows
        data.forEach((item: any) => {
          const row = headers.map(header => item[header]);
          worksheet.addRow(row);
        });
        
        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      
      case FileType.JSON:
        const jsonString = JSON.stringify(data, null, 2);
        blob = new Blob([jsonString], { type: 'application/json' });
        mimeType = 'application/json';
        break;
      
      case FileType.TEXT:
        const textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        blob = new Blob([textContent], { type: 'text/plain' });
        mimeType = 'text/plain';
        break;
      
      default:
        throw new Error(`Unsupported file type for download: ${fileType}`);
    }
    
    // Create download URL
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return url;
  } catch (error) {
    console.error('Error generating file download:', error);
    throw error;
  }
}