import * as XLSX from 'xlsx';

export interface ImportConfig {
  type: 'file' | 'sql' | 'mongodb' | 'api' | 'synthetic';
  file?: File;
  sqlConfig?: {
    endpoint: string;
    tableName: string;
    limit: number;
    columns: string[];
  };
  mongodbConfig?: {
    endpoint: string;
    collectionName: string;
    limit: number;
    columns: string[];
  };
  apiConfig?: {
    url: string;
    dataField: string;
    fields: string[];
  };
  syntheticConfig?: {
    prompt: string;
    limit: number;
  };
}

export interface ImportResult {
  success: boolean;
  data: any[][];
  error?: string;
  columns?: string[];
}

/**
 * Import data from uploaded file (CSV/XLSX)
 */
export async function importFromFile(file: File): Promise<ImportResult> {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      return {
        success: false,
        data: [],
        error: 'Unsupported file format. Please upload CSV or XLSX files only.'
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to array of arrays
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const data = jsonData as any[][];
    
    // Extract headers (first row)
    const headers = data[0] || [];
    const rows = data.slice(1);
    
    return {
      success: true,
      data: rows,
      columns: headers
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Import data from SQL database
 */
export async function importFromSQL(config: ImportConfig['sqlConfig']): Promise<ImportResult> {
  try {
    if (!config) {
      return {
        success: false,
        data: [],
        error: 'SQL configuration is required'
      };
    }

    const response = await fetch('http://localhost:8000/api/v1/import/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: config.endpoint,
        tableName: config.tableName,
        limit: config.limit,
        columns: config.columns
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        data: [],
        error: errorData.detail || 'Failed to fetch data from SQL database'
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      columns: result.columns
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: `Error connecting to SQL database: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Import data from MongoDB
 */
export async function importFromMongoDB(config: ImportConfig['mongodbConfig']): Promise<ImportResult> {
  try {
    if (!config) {
      return {
        success: false,
        data: [],
        error: 'MongoDB configuration is required'
      };
    }

    const response = await fetch('http://localhost:8000/api/v1/import/mongodb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: config.endpoint,
        collectionName: config.collectionName,
        limit: config.limit,
        columns: config.columns
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        data: [],
        error: errorData.detail || 'Failed to fetch data from MongoDB'
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      columns: result.columns
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: `Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Import data from API endpoint
 */
export async function importFromAPI(config: ImportConfig['apiConfig']): Promise<ImportResult> {
  try {
    if (!config) {
      return {
        success: false,
        data: [],
        error: 'API configuration is required'
      };
    }

    const response = await fetch('http://localhost:8000/api/v1/import/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: config.url,
        dataField: config.dataField,
        fields: config.fields
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        data: [],
        error: errorData.detail || 'Failed to fetch data from API'
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      columns: result.columns
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: `Error fetching data from API: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Import synthetic data generated by LLM
 */
export async function importSyntheticData(config: ImportConfig['syntheticConfig']): Promise<ImportResult> {
  try {
    if (!config) {
      return {
        success: false,
        data: [],
        error: 'Synthetic data configuration is required'
      };
    }

    const response = await fetch('http://localhost:8000/api/v1/import/synthetic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: config.prompt,
        limit: config.limit
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        data: [],
        error: errorData.detail || 'Failed to generate synthetic data'
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      columns: result.columns
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: `Error generating synthetic data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Main import function that routes to appropriate import method
 */
export async function importData(config: ImportConfig): Promise<ImportResult> {
  switch (config.type) {
    case 'file':
      if (!config.file) {
        return {
          success: false,
          data: [],
          error: 'File is required for file import'
        };
      }
      return importFromFile(config.file);
    
    case 'sql':
      return importFromSQL(config.sqlConfig);
    
    case 'mongodb':
      return importFromMongoDB(config.mongodbConfig);
    
    case 'api':
      return importFromAPI(config.apiConfig);
    
    case 'synthetic':
      return importSyntheticData(config.syntheticConfig);
    
    default:
      return {
        success: false,
        data: [],
        error: 'Invalid import type'
      };
  }
}

/**
 * Utility function to convert data to spreadsheet format
 */
export function convertToSpreadsheetData(data: any[][], columns?: string[]): any[][] {
  if (!data || data.length === 0) return [];
  
  // If columns are provided, use them as headers
  if (columns && columns.length > 0) {
    return [columns, ...data];
  }
  
  // Otherwise, use the first row as headers if it exists
  return data;
}
