import { TrainRequest, PredictRequest, TrainResponse, PredictResponse } from '../types/ml';

const API_BASE_URL = '/api/v1/ml';

export class MLService {
  static async trainModel(payload: TrainRequest): Promise<TrainResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/train-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Training failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Training error:', error);
      throw error;
    }
  }

  static async predict(payload: PredictRequest): Promise<PredictResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  static async downloadModel(modelPath: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/download-model?model_path=${encodeURIComponent(modelPath)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  static prepareTrainingData(
    sheetData: any,
    featureColumns: string[],
    labelColumn: string
  ): { X: number[][]; y: number[] } {
    const X: number[][] = [];
    const y: number[] = [];

    // Find the maximum row index
    let maxRow = 0;
    Object.keys(sheetData).forEach(cellKey => {
      const parts = cellKey.split('-');
      if (parts.length === 2) {
        const rowIndex = parseInt(parts[0]);
        if (!isNaN(rowIndex) && rowIndex > maxRow) {
          maxRow = rowIndex;
        }
      }
    });

    // Start from row 1 (skip header row 0)
    for (let row = 1; row <= maxRow; row++) {
      const featureRow: number[] = [];
      let hasValidData = true;

      // Extract feature values by finding the column index for each feature column name
      for (const featureCol of featureColumns) {
        let found = false;
        // Search through all columns to find the one with this header
        for (let col = 0; col <= 26; col++) { // Reasonable limit for columns
          const cellKey = `${row}-${col}`;
          const cellData = sheetData[cellKey];
          if (cellData && cellData.value && cellData.value.trim() !== '') {
            // Check if this is the feature column we're looking for
            const headerKey = `0-${col}`;
            const headerData = sheetData[headerKey];
            if (headerData && headerData.value && headerData.value.trim() === featureCol) {
              const value = Number(cellData.value);
              if (!isNaN(value)) {
                featureRow.push(value);
                found = true;
                break;
              }
            }
          }
        }
        if (!found) {
          hasValidData = false;
          break;
        }
      }

      // Extract label value
      let labelValue: number | null = null;
      for (let col = 0; col <= 26; col++) {
        const cellKey = `${row}-${col}`;
        const cellData = sheetData[cellKey];
        if (cellData && cellData.value && cellData.value.trim() !== '') {
          const headerKey = `0-${col}`;
          const headerData = sheetData[headerKey];
          if (headerData && headerData.value && headerData.value.trim() === labelColumn) {
            const value = Number(cellData.value);
            if (!isNaN(value)) {
              labelValue = value;
              break;
            }
          }
        }
      }

      if (hasValidData && featureRow.length === featureColumns.length && labelValue !== null) {
        X.push(featureRow);
        y.push(labelValue);
      }
    }

    return { X, y };
  }

  static preparePredictionData(
    sheetData: any,
    featureColumns: string[]
  ): number[][] {
    const X: number[][] = [];

    // Find the maximum row index
    let maxRow = 0;
    Object.keys(sheetData).forEach(cellKey => {
      const parts = cellKey.split('-');
      if (parts.length === 2) {
        const rowIndex = parseInt(parts[0]);
        if (!isNaN(rowIndex) && rowIndex > maxRow) {
          maxRow = rowIndex;
        }
      }
    });

    // Start from row 1 (skip header row 0)
    for (let row = 1; row <= maxRow; row++) {
      const featureRow: number[] = [];
      let hasValidData = true;

      // Extract feature values by finding the column index for each feature column name
      for (const featureCol of featureColumns) {
        let found = false;
        // Search through all columns to find the one with this header
        for (let col = 0; col <= 26; col++) { // Reasonable limit for columns
          const cellKey = `${row}-${col}`;
          const cellData = sheetData[cellKey];
          if (cellData && cellData.value && cellData.value.trim() !== '') {
            // Check if this is the feature column we're looking for
            const headerKey = `0-${col}`;
            const headerData = sheetData[headerKey];
            if (headerData && headerData.value && headerData.value.trim() === featureCol) {
              const value = Number(cellData.value);
              if (!isNaN(value)) {
                featureRow.push(value);
                found = true;
                break;
              }
            }
          }
        }
        if (!found) {
          hasValidData = false;
          break;
        }
      }

      if (hasValidData && featureRow.length === featureColumns.length) {
        X.push(featureRow);
      }
    }

    return X;
  }
}
