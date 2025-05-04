import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { scanFile } from './scanner';

interface ParseOptions {
  delimiter?: string;
  columns?: boolean | string[];
  skip_empty_lines?: boolean;
  trim?: boolean;
  skip_lines_with_error?: boolean;
}

interface FormatOptions {
  delimiter?: string;
  header?: boolean;
  columns?: string[];
}

/**
 * Parse CSV file to JSON
 * @param filePath Path to the CSV file
 * @param options Parse options
 * @returns Parsed data as array of objects
 */
export async function parseCSV(filePath: string, options: ParseOptions = {}): Promise<any[]> {
  try {
    // Scan file for viruses first
    const scanResult = await scanFile(filePath);
    
    if (scanResult.isInfected || !scanResult.isAllowedType || !scanResult.isAllowedSize) {
      throw new Error(scanResult.error || 'File scan failed');
    }
    
    // Read file content
    const fs = await import('fs/promises');
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Set default options
    const defaultOptions: ParseOptions = {
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skip_lines_with_error: false
    };
    
    // Parse CSV
    const records = parse(fileContent, { ...defaultOptions, ...options });
    
    return records;
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    throw error;
  }
}

/**
 * Parse CSV string to JSON
 * @param csvString CSV string content
 * @param options Parse options
 * @returns Parsed data as array of objects
 */
export function parseCSVString(csvString: string, options: ParseOptions = {}): any[] {
  try {
    // Set default options
    const defaultOptions: ParseOptions = {
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skip_lines_with_error: false
    };
    
    // Parse CSV
    const records = parse(csvString, { ...defaultOptions, ...options });
    
    return records;
  } catch (error) {
    console.error('Error parsing CSV string:', error);
    throw error;
  }
}

/**
 * Format data to CSV string
 * @param data Array of objects to format
 * @param options Format options
 * @returns CSV string
 */
export function formatToCSV(data: any[], options: FormatOptions = {}): string {
  try {
    // Set default options
    const defaultOptions: FormatOptions = {
      delimiter: ',',
      header: true
    };
    
    // Format to CSV
    const csvString = stringify(data, { ...defaultOptions, ...options });
    
    return csvString;
  } catch (error) {
    console.error('Error formatting to CSV:', error);
    throw error;
  }
}

/**
 * Save data to CSV file
 * @param data Array of objects to save
 * @param filePath Path to save the CSV file
 * @param options Format options
 * @returns Path to the saved file
 */
export async function saveToCSV(data: any[], filePath: string, options: FormatOptions = {}): Promise<string> {
  try {
    // Format to CSV
    const csvString = formatToCSV(data, options);
    
    // Write to file
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, csvString, 'utf8');
    
    return filePath;
  } catch (error) {
    console.error('Error saving to CSV file:', error);
    throw error;
  }
}

/**
 * Validate CSV data against a schema
 * @param data Parsed CSV data
 * @param schema Schema definition
 * @returns Validation result
 */
export function validateCSVData(
  data: any[],
  schema: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'date';
    required?: boolean;
    validate?: (value: any) => boolean;
  }>
): {
  isValid: boolean;
  errors: Array<{
    row: number;
    column: string;
    message: string;
  }>;
} {
  const errors: Array<{
    row: number;
    column: string;
    message: string;
  }> = [];
  
  // Validate each row
  data.forEach((row, rowIndex) => {
    // Check required fields
    Object.entries(schema).forEach(([column, definition]) => {
      const value = row[column];
      
      // Check if required field is missing
      if (definition.required && (value === undefined || value === null || value === '')) {
        errors.push({
          row: rowIndex + 1, // 1-based index for user-friendly error messages
          column,
          message: `Required field "${column}" is missing`
        });
        return;
      }
      
      // Skip validation if value is empty and not required
      if ((value === undefined || value === null || value === '') && !definition.required) {
        return;
      }
      
      // Validate type
      switch (definition.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push({
              row: rowIndex + 1,
              column,
              message: `Field "${column}" must be a number`
            });
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean' && !['true', 'false', '0', '1', 'yes', 'no'].includes(String(value).toLowerCase())) {
            errors.push({
              row: rowIndex + 1,
              column,
              message: `Field "${column}" must be a boolean`
            });
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push({
              row: rowIndex + 1,
              column,
              message: `Field "${column}" must be a valid date`
            });
          }
          break;
      }
      
      // Run custom validation if provided
      if (definition.validate && !definition.validate(value)) {
        errors.push({
          row: rowIndex + 1,
          column,
          message: `Field "${column}" failed validation`
        });
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}