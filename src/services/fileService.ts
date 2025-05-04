import { 
  processFile, 
  processFileUpload, 
  generateFileDownload, 
  parseExcel, 
  convertExcelToCSV, 
  saveToExcel, 
  FileType 
} from '../lib/file-service';
import { parseCSV, parseCSVString, formatToCSV, saveToCSV, validateCSVData } from './file-upload/csv-parser';
import { scanFile, scanStream, initScanner } from './file-upload/scanner';
import { generatePayrollPDF, generatePayStubPDF, generateTaxReportPDF } from './reports/pdf-generator';

/**
 * FileService class provides a unified interface to all file-related functionality
 */
export class FileService {
  /**
   * Initialize the file service
   */
  static async initialize() {
    try {
      await initScanner();
      console.log('File service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize file service:', error);
    }
  }

  /**
   * Process a file based on its type
   * @param filePath Path to the file
   * @returns Processed data
   */
  static async processFile(filePath: string) {
    return processFile(filePath);
  }

  /**
   * Process a file upload
   * @param file File object from form upload
   * @param allowedTypes Array of allowed file types
   * @returns Processed file data
   */
  static async processFileUpload(
    file: File,
    allowedTypes: FileType[] = [FileType.CSV, FileType.EXCEL]
  ) {
    return processFileUpload(file, allowedTypes);
  }

  /**
   * Generate a file download
   * @param data Data to include in the file
   * @param fileName Name for the download file
   * @param fileType Type of file to generate
   * @returns Blob URL for download
   */
  static async generateFileDownload(
    data: any,
    fileName: string,
    fileType: FileType
  ) {
    return generateFileDownload(data, fileName, fileType);
  }

  /**
   * Parse CSV file to JSON
   * @param filePath Path to the CSV file
   * @param options Parse options
   * @returns Parsed data as array of objects
   */
  static async parseCSV(filePath: string, options = {}) {
    return parseCSV(filePath, options);
  }

  /**
   * Parse CSV string to JSON
   * @param csvString CSV string content
   * @param options Parse options
   * @returns Parsed data as array of objects
   */
  static parseCSVString(csvString: string, options = {}) {
    return parseCSVString(csvString, options);
  }

  /**
   * Format data to CSV string
   * @param data Array of objects to format
   * @param options Format options
   * @returns CSV string
   */
  static formatToCSV(data: any[], options = {}) {
    return formatToCSV(data, options);
  }

  /**
   * Save data to CSV file
   * @param data Array of objects to save
   * @param filePath Path to save the CSV file
   * @param options Format options
   * @returns Path to the saved file
   */
  static async saveToCSV(data: any[], filePath: string, options = {}) {
    return saveToCSV(data, filePath, options);
  }

  /**
   * Parse Excel file to JSON
   * @param filePath Path to the Excel file
   * @returns Parsed data as array of objects
   */
  static async parseExcel(filePath: string) {
    return parseExcel(filePath);
  }

  /**
   * Convert Excel file to CSV
   * @param excelFilePath Path to the Excel file
   * @param csvFilePath Path to save the CSV file
   * @returns Path to the saved CSV file
   */
  static async convertExcelToCSV(excelFilePath: string, csvFilePath: string) {
    return convertExcelToCSV(excelFilePath, csvFilePath);
  }

  /**
   * Save data to Excel file
   * @param data Array of objects to save
   * @param filePath Path to save the Excel file
   * @returns Path to the saved file
   */
  static async saveToExcel(data: any[], filePath: string) {
    return saveToExcel(data, filePath);
  }

  /**
   * Validate CSV data against a schema
   * @param data Parsed CSV data
   * @param schema Schema definition
   * @returns Validation result
   */
  static validateCSVData(
    data: any[],
    schema: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'date';
      required?: boolean;
      validate?: (value: any) => boolean;
    }>
  ) {
    return validateCSVData(data, schema);
  }

  /**
   * Scan a file for viruses
   * @param filePath Path to the file
   * @returns Scan result
   */
  static async scanFile(filePath: string) {
    return scanFile(filePath);
  }

  /**
   * Scan a file stream for viruses
   * @param fileStream Readable stream of the file
   * @param fileSize Size of the file in bytes
   * @param fileExtension Extension of the file
   * @returns Scan result
   */
  static async scanStream(
    fileStream: NodeJS.ReadableStream,
    fileSize: number,
    fileExtension: string
  ) {
    return scanStream(fileStream, fileSize, fileExtension);
  }

  /**
   * Generate a PDF payroll report
   * @param payrollData Payroll data to include in the report
   * @returns PDF document as Blob
   */
  static async generatePayrollPDF(payrollData: any) {
    return generatePayrollPDF(payrollData);
  }

  /**
   * Generate a PDF pay stub
   * @param payStubData Pay stub data
   * @returns PDF document as Blob
   */
  static async generatePayStubPDF(payStubData: any) {
    return generatePayStubPDF(payStubData);
  }

  /**
   * Generate a PDF tax report
   * @param taxData Tax report data
   * @returns PDF document as Blob
   */
  static async generateTaxReportPDF(taxData: any) {
    return generateTaxReportPDF(taxData);
  }

  /**
   * Get file type from file extension
   * @param filename Filename with extension
   * @returns FileType enum value
   */
  static getFileType(filename: string) {
    return FileType[filename.split('.').pop()?.toUpperCase() as keyof typeof FileType] || FileType.UNKNOWN;
  }
}