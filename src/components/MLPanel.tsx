import React, { useState, useEffect, useRef } from 'react';
import { Brain, BarChart3, Settings, Eye, Target, Play, Download, FileSpreadsheet, Database, Zap, TrendingUp } from 'lucide-react';
import { MLState, MLColumn, MLModel, MLFormData, MLMetrics } from '../types/ml';
import { MLService } from '../utils/ml';
import { SpreadsheetData } from '../types/spreadsheet';
import { FileItem } from '../types/project';

const AVAILABLE_MODELS: MLModel[] = [
  {
    id: 'logistic_regression',
    name: 'logistic_regression',
    type: 'logistic_regression',
    displayName: 'Logistic Regression',
    description: 'Linear model for classification tasks'
  },
  {
    id: 'random_forest',
    name: 'random_forest',
    type: 'random_forest',
    displayName: 'Random Forest',
    description: 'Ensemble method using multiple decision trees'
  }
];

interface MLPanelProps {
  projectData: any;
  onClose: () => void;
}

const MLPanel: React.FC<MLPanelProps> = ({ projectData, onClose }) => {
  const [mlState, setMlState] = useState<MLState>({
    selectedSheet: null,
    featureColumns: [],
    labelColumn: null,
    selectedModel: null,
    isTraining: false,
    isPredicting: false,
    trainingMetrics: null,
    modelPath: null,
    predictionResults: null,
    currentStep: 0,
    hyperparameters: {},
    dataPreview: [],
    showDataPreview: true,
    showHyperparameters: true,
    showMetrics: false,
    showPrediction: false
  });

  const [formData, setFormData] = useState<MLFormData>({
    sheetId: '',
    featureColumns: [],
    labelColumn: '',
    modelType: ''
  });

  const [availableSheets, setAvailableSheets] = useState<FileItem[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedSheetData, setSelectedSheetData] = useState<SpreadsheetData | null>(null);
  const [predictionSheetId, setPredictionSheetId] = useState<string>('');
  const [predictionColumns, setPredictionColumns] = useState<string[]>([]);
  const [predictionSheetData, setPredictionSheetData] = useState<SpreadsheetData | null>(null);

  useEffect(() => {
    // Get available sheets
    const sheets = Object.values(projectData.files).filter((file: any) => file.type === 'spreadsheet') as FileItem[];
    setAvailableSheets(sheets);
  }, [projectData]);

  useEffect(() => {
    if (formData.sheetId && projectData.files[formData.sheetId]) {
      const sheetData = projectData.files[formData.sheetId].data;
      setSelectedSheetData(sheetData);
      
      console.log('Sheet data keys:', Object.keys(sheetData).slice(0, 10)); // Debug: show first 10 keys
      
      // Extract actual column headers from the first row (row 0)
      const columns = new Set<string>();
      let maxCol = 0;
      
      // First pass: find the maximum column index
      Object.keys(sheetData).forEach(cellKey => {
        const parts = cellKey.split('-');
        if (parts.length === 2) {
          const colIndex = parseInt(parts[1]);
          if (!isNaN(colIndex) && colIndex > maxCol) {
            maxCol = colIndex;
          }
        }
      });
      
      // Second pass: check if first row has actual header text
      let hasHeaders = false;
      for (let col = 0; col <= maxCol; col++) {
        const cellKey = `0-${col}`;
        const cellData = sheetData[cellKey];
        if (cellData && cellData.value && cellData.value.trim() !== '') {
          // Use the actual header text from the first row
          columns.add(cellData.value.trim());
          hasHeaders = true;
        }
      }
      
      // If no headers found in first row, use column letters as fallback
      if (!hasHeaders) {
        for (let col = 0; col <= maxCol; col++) {
          // Convert column index to Excel-style name (A, B, C, D...)
          let colName = '';
          let tempCol = col;
          while (tempCol >= 0) {
            colName = String.fromCharCode(65 + (tempCol % 26)) + colName;
            tempCol = Math.floor(tempCol / 26) - 1;
          }
          columns.add(colName);
        }
      }
      
      const sortedColumns = Array.from(columns).sort((a, b) => {
        // If using actual headers, sort alphabetically
        if (hasHeaders) {
          return a.localeCompare(b);
        }
        // If using column letters, sort properly: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, AA, AB, AC...
        if (a.length === 1 && b.length === 1) {
          return a.localeCompare(b);
        }
        return a.length - b.length;
      });
      
      setAvailableColumns(sortedColumns);
      console.log('Sheet data structure:', { maxCol, hasHeaders, totalKeys: Object.keys(sheetData).length });
      console.log('Available columns:', sortedColumns);
      console.log('Total columns found:', sortedColumns.length);
    }
  }, [formData.sheetId, projectData]);

  useEffect(() => {
    if (predictionSheetId && projectData.files[predictionSheetId]) {
      const sheetData = projectData.files[predictionSheetId].data;
      setPredictionSheetData(sheetData);
      
      // Extract columns for prediction sheet
      const columns = new Set<string>();
      let maxCol = 0;
      
      Object.keys(sheetData).forEach(cellKey => {
        const parts = cellKey.split('-');
        if (parts.length === 2) {
          const colIndex = parseInt(parts[1]);
          if (!isNaN(colIndex) && colIndex > maxCol) {
            maxCol = colIndex;
          }
        }
      });
      
      let hasHeaders = false;
      for (let col = 0; col <= maxCol; col++) {
        const cellKey = `0-${col}`;
        const cellData = sheetData[cellKey];
        if (cellData && cellData.value && cellData.value.trim() !== '') {
          columns.add(cellData.value.trim());
          hasHeaders = true;
        }
      }
      
      if (!hasHeaders) {
        for (let col = 0; col <= maxCol; col++) {
          let colName = '';
          let tempCol = col;
          while (tempCol >= 0) {
            colName = String.fromCharCode(65 + (tempCol % 26)) + colName;
            tempCol = Math.floor(tempCol / 26) - 1;
          }
          columns.add(colName);
        }
      }
      
      const sortedColumns = Array.from(columns).sort((a, b) => {
        if (hasHeaders) {
          return a.localeCompare(b);
        }
        if (a.length === 1 && b.length === 1) {
          return a.localeCompare(b);
        }
        return a.length - b.length;
      });
      
      setPredictionColumns(sortedColumns);
    }
  }, [predictionSheetId, projectData]);



  const handleTrain = async () => {
    if (!selectedSheetData || !formData.featureColumns.length || !formData.labelColumn || !formData.modelType) {
      return;
    }

    setMlState(prev => ({ ...prev, isTraining: true }));

    try {
      const { X, y } = MLService.prepareTrainingData(
        selectedSheetData,
        formData.featureColumns,
        formData.labelColumn
      );

      if (X.length === 0 || y.length === 0) {
        throw new Error('No valid data found for training');
      }

      const response = await MLService.trainModel({
        X,
        y,
        model_name: formData.modelType
      });

      setMlState(prev => ({
        ...prev,
        trainingMetrics: response.metrics,
        modelPath: response.model_file,
        showMetrics: true,
        isTraining: false
      }));

      // Move to metrics step
      setMlState(prev => ({ ...prev, currentStep: 3 }));
    } catch (error) {
      console.error('Training failed:', error);
      setMlState(prev => ({ ...prev, isTraining: false }));
      alert(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePredict = async () => {
    if (!predictionSheetData || !formData.featureColumns.length || !mlState.modelPath) {
      return;
    }

    setMlState(prev => ({ ...prev, isPredicting: true }));

    try {
      const X_new = MLService.preparePredictionData(
        predictionSheetData,
        formData.featureColumns
      );

      if (X_new.length === 0) {
        throw new Error('No valid data found for prediction');
      }

      const response = await MLService.predict({
        X_new,
        model_path: mlState.modelPath
      });

      setMlState(prev => ({
        ...prev,
        predictionResults: response.predictions,
        showPrediction: true,
        isPredicting: false
      }));
    } catch (error) {
      console.error('Prediction failed:', error);
      setMlState(prev => ({ ...prev, isPredicting: false }));
      alert(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderDataSelectionSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Data Selection</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Spreadsheet
          </label>
          <select
            value={formData.sheetId}
            onChange={(e) => setFormData(prev => ({ ...prev, sheetId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Choose a spreadsheet...</option>
            {availableSheets.map(sheet => (
              <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
            ))}
          </select>
        </div>

        {formData.sheetId && availableColumns.length > 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feature Columns
              </label>
              <select
                multiple
                value={formData.featureColumns}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, featureColumns: selected }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[80px]"
              >
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label Column
              </label>
              <select
                value={formData.labelColumn}
                onChange={(e) => setFormData(prev => ({ ...prev, labelColumn: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">Choose label column...</option>
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderModelConfigSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Model Configuration</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Type
          </label>
          <div className="space-y-2">
            {AVAILABLE_MODELS.map(model => (
              <div
                key={model.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.modelType === model.type
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, modelType: model.type }))}
              >
                <div className="flex items-center space-x-3">
                  <Brain className="h-4 w-4 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{model.displayName}</h4>
                    <p className="text-sm text-gray-500">{model.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleTrain}
            disabled={mlState.isTraining || !formData.sheetId || !formData.featureColumns.length || !formData.labelColumn || !formData.modelType}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mlState.isTraining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Training...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Train Model
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMetricsSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Training Metrics</h3>
      </div>
      
      {mlState.trainingMetrics ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">
                {(mlState.trainingMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-700">
                {(mlState.trainingMetrics.f1 * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">F1 Score</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-800">
                {(mlState.trainingMetrics.precision * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Precision</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-600">
                {(mlState.trainingMetrics.recall * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Recall</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => MLService.downloadModel(mlState.modelPath!)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Model
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No training results yet</p>
        </div>
      )}
    </div>
  );

  const renderPredictionSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Make Predictions</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prediction Spreadsheet
          </label>
          <select
            value={predictionSheetId}
            onChange={(e) => setPredictionSheetId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Choose a spreadsheet...</option>
            {availableSheets.map(sheet => (
              <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
            ))}
          </select>
        </div>

        {predictionSheetId && predictionColumns.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feature Columns (must match training data)
            </label>
            <select
              multiple
              value={formData.featureColumns}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData(prev => ({ ...prev, featureColumns: selected }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[80px]"
            >
              {predictionColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={mlState.isPredicting || !predictionSheetId || !formData.featureColumns.length || !mlState.modelPath}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mlState.isPredicting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Predicting...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Make Predictions
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderResultsSection = () => {
    const getPredictionData = () => {
      if (!mlState.predictionResults || !predictionSheetData || !formData.featureColumns.length) {
        return [];
      }

      const results = [];
      let maxRow = 0;
      
      // Find the maximum row index
      Object.keys(predictionSheetData).forEach(cellKey => {
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
        const rowData: any = { row, features: {}, prediction: null };
        
        // Extract feature values
        for (const featureCol of formData.featureColumns) {
          for (let col = 0; col <= 26; col++) {
            const cellKey = `${row}-${col}`;
            const cellData = predictionSheetData[cellKey];
            if (cellData && cellData.value && cellData.value.trim() !== '') {
              const headerKey = `0-${col}`;
              const headerData = predictionSheetData[headerKey];
              if (headerData && headerData.value && headerData.value.trim() === featureCol) {
                rowData.features[featureCol] = cellData.value;
                break;
              }
            }
          }
        }
        
        // Add prediction if we have all features
        if (Object.keys(rowData.features).length === formData.featureColumns.length) {
          const predictionIndex = row - 1;
          if (predictionIndex < mlState.predictionResults.length) {
            rowData.prediction = mlState.predictionResults[predictionIndex];
            results.push(rowData);
          }
        }
      }
      
      return results;
    };

    const predictionData = getPredictionData();

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Prediction Results</h3>
        </div>
        
        {predictionData.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-3">
                Predictions with Feature Values ({predictionData.length} rows):
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Row</th>
                      {formData.featureColumns.map(col => (
                        <th key={col} className="text-left py-2 px-2 font-medium text-gray-700">{col}</th>
                      ))}
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Prediction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionData.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-600">{row.row}</td>
                        {formData.featureColumns.map(col => (
                          <td key={col} className="py-2 px-2">{row.features[col] || '-'}</td>
                        ))}
                        <td className="py-2 px-2 font-medium text-gray-900">{row.prediction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No predictions yet</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Machine Learning Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-4 p-4">
          {/* Left Column - Data Selection & Model Config */}
          <div className="col-span-4 space-y-4">
            {renderDataSelectionSection()}
            {renderModelConfigSection()}
          </div>

          {/* Middle Column - Metrics & Training */}
          <div className="col-span-4 space-y-4">
            {renderMetricsSection()}
          </div>

          {/* Right Column - Prediction & Results */}
          <div className="col-span-4 space-y-4">
            {renderPredictionSection()}
            {renderResultsSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPanel;
