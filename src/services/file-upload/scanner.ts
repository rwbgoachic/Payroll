import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { ClamScan } from 'clamscan';

// Maximum file size for scanning (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed file types
const ALLOWED_EXTENSIONS = [
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.csv',
  // Images
  '.jpg', '.jpeg', '.png', '.gif', '.svg',
  // Archives
  '.zip', '.rar', '.7z',
  // Other
  '.xml', '.json'
];

// ClamAV configuration
const clamConfig = {
  removeInfected: true,
  quarantineInfected: false,
  scanLog: null,
  debugMode: false,
  fileList: null,
  scanRecursively: true,
  clamscan: {
    path: '/usr/bin/clamscan',
    db: null,
    scanArchives: true,
    active: true
  },
  clamdscan: {
    socket: '/var/run/clamav/clamd.sock',
    host: 'localhost',
    port: 3310,
    timeout: 60000,
    localFallback: true,
    path: '/usr/bin/clamdscan',
    configFile: null,
    multiscan: true,
    reloadDb: false,
    active: true
  },
  preference: 'clamdscan'
};

// Initialize ClamAV scanner
let scanner: ClamScan | null = null;

/**
 * Initialize the virus scanner
 */
export async function initScanner(): Promise<void> {
  try {
    scanner = await new ClamScan(clamConfig).init();
    console.log('Virus scanner initialized successfully');
  } catch (error) {
    console.error('Failed to initialize virus scanner:', error);
    // Fall back to mock scanner in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock scanner in development mode');
    } else {
      throw error;
    }
  }
}

/**
 * Check if a file is safe
 * @param filePath Path to the file
 * @returns Object with scan result
 */
export async function scanFile(filePath: string): Promise<{
  isInfected: boolean;
  isAllowedType: boolean;
  isAllowedSize: boolean;
  error?: string;
}> {
  try {
    // Check file extension
    const fileExtension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    const isAllowedType = ALLOWED_EXTENSIONS.includes(fileExtension);
    
    if (!isAllowedType) {
      return {
        isInfected: false,
        isAllowedType: false,
        isAllowedSize: true,
        error: `File type ${fileExtension} is not allowed`
      };
    }
    
    // Check file size
    const fileStats = await stat(filePath);
    const isAllowedSize = fileStats.size <= MAX_FILE_SIZE;
    
    if (!isAllowedSize) {
      return {
        isInfected: false,
        isAllowedType: true,
        isAllowedSize: false,
        error: `File size ${fileStats.size} exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`
      };
    }
    
    // Scan file for viruses
    if (scanner) {
      const { isInfected, file, viruses } = await scanner.scanFile(filePath);
      
      if (isInfected) {
        return {
          isInfected: true,
          isAllowedType: true,
          isAllowedSize: true,
          error: `File is infected with: ${viruses.join(', ')}`
        };
      }
    } else if (process.env.NODE_ENV !== 'development') {
      // In production, fail if scanner is not available
      return {
        isInfected: false,
        isAllowedType: true,
        isAllowedSize: true,
        error: 'Virus scanner is not available'
      };
    }
    
    // File is safe
    return {
      isInfected: false,
      isAllowedType: true,
      isAllowedSize: true
    };
  } catch (error) {
    console.error('Error scanning file:', error);
    return {
      isInfected: false,
      isAllowedType: true,
      isAllowedSize: true,
      error: error instanceof Error ? error.message : 'Unknown error during file scan'
    };
  }
}

/**
 * Scan a file stream
 * @param fileStream Readable stream of the file
 * @param fileSize Size of the file in bytes
 * @param fileExtension Extension of the file
 * @returns Object with scan result
 */
export async function scanStream(
  fileStream: NodeJS.ReadableStream,
  fileSize: number,
  fileExtension: string
): Promise<{
  isInfected: boolean;
  isAllowedType: boolean;
  isAllowedSize: boolean;
  error?: string;
}> {
  try {
    // Check file extension
    const normalizedExtension = fileExtension.startsWith('.') 
      ? fileExtension.toLowerCase() 
      : `.${fileExtension.toLowerCase()}`;
    
    const isAllowedType = ALLOWED_EXTENSIONS.includes(normalizedExtension);
    
    if (!isAllowedType) {
      return {
        isInfected: false,
        isAllowedType: false,
        isAllowedSize: true,
        error: `File type ${normalizedExtension} is not allowed`
      };
    }
    
    // Check file size
    const isAllowedSize = fileSize <= MAX_FILE_SIZE;
    
    if (!isAllowedSize) {
      return {
        isInfected: false,
        isAllowedType: true,
        isAllowedSize: false,
        error: `File size ${fileSize} exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`
      };
    }
    
    // Scan file for viruses
    if (scanner) {
      const { isInfected, viruses } = await scanner.scanStream(fileStream);
      
      if (isInfected) {
        return {
          isInfected: true,
          isAllowedType: true,
          isAllowedSize: true,
          error: `File is infected with: ${viruses.join(', ')}`
        };
      }
    } else if (process.env.NODE_ENV !== 'development') {
      // In production, fail if scanner is not available
      return {
        isInfected: false,
        isAllowedType: true,
        isAllowedSize: true,
        error: 'Virus scanner is not available'
      };
    }
    
    // File is safe
    return {
      isInfected: false,
      isAllowedType: true,
      isAllowedSize: true
    };
  } catch (error) {
    console.error('Error scanning file stream:', error);
    return {
      isInfected: false,
      isAllowedType: true,
      isAllowedSize: true,
      error: error instanceof Error ? error.message : 'Unknown error during file scan'
    };
  }
}