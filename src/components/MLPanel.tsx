import React, { useState, useEffect } from 'react';
import { Brain, BarChart3, Settings, Eye, Target, Play, Download, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
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

  const handleNext = () => {
    if (mlState.currentStep < 3) {
      setMlState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const handlePrevious = () => {
    if (mlState.currentStep > 0) {
      setMlState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

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
    if (!selectedSheetData || !formData.featureColumns.length || !mlState.modelPath) {
      return;
    }

    setMlState(prev => ({ ...prev, isPredicting: true }));

    try {
      const X_new = MLService.preparePredictionData(
        selectedSheetData,
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

  const steps = [
    { title: 'Select Data', description: 'Choose sheet and columns' },
    { title: 'Configure Model', description: 'Select model type and parameters' },
    { title: 'Train Model', description: 'Train and evaluate the model' },
    { title: 'Results & Predict', description: 'View metrics and make predictions' }
  ];

  const renderStepContent = () => {
    switch (mlState.currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Spreadsheet
              </label>
              <select
                value={formData.sheetId}
                onChange={(e) => setFormData(prev => ({ ...prev, sheetId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a spreadsheet...</option>
                {availableSheets.map(sheet => (
                  <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
                ))}
              </select>
            </div>

            {formData.sheetId && (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Available columns:</strong> {availableColumns.length > 0 ? availableColumns.join(', ') : 'No columns found'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Total columns detected: {availableColumns.length}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Columns (Select multiple)
                  </label>
                  {availableColumns.length > 0 ? (
                    <select
                      multiple
                      value={formData.featureColumns}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({ ...prev, featureColumns: selected }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                    >
                      {availableColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-center">
                      No columns available. Please check your spreadsheet data.
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple columns</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Column
                  </label>
                  {availableColumns.length > 0 ? (
                    <select
                      value={formData.labelColumn}
                      onChange={(e) => setFormData(prev => ({ ...prev, labelColumn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Choose label column...</option>
                      {availableColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-center">
                      No columns available
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model Type
              </label>
              <div className="grid grid-cols-1 gap-4">
                {AVAILABLE_MODELS.map(model => (
                  <div
                    key={model.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.modelType === model.type
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, modelType: model.type }))}
                  >
                    <div className="flex items-center space-x-3">
                      <Brain className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{model.displayName}</h3>
                        <p className="text-sm text-gray-500">{model.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {mlState.showHyperparameters && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Hyperparameters</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Advanced hyperparameter tuning will be available in future updates.
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Train</h3>
              <p className="text-gray-500 mb-6">
                Your model is configured and ready for training. Click the button below to start.
              </p>
              
              <button
                onClick={handleTrain}
                disabled={mlState.isTraining}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {mlState.showDataPreview && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Data Preview</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Data preview functionality will be available in future updates.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {mlState.trainingMetrics && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">Training Results</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(mlState.trainingMetrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(mlState.trainingMetrics.f1 * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">F1 Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(mlState.trainingMetrics.precision * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Precision</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {(mlState.trainingMetrics.recall * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Recall</div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePredict}
                    disabled={mlState.isPredicting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {mlState.isPredicting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Make Predictions
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => MLService.downloadModel(mlState.modelPath!)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Model
                  </button>
                </div>
              </div>
            )}

            {mlState.predictionResults && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Prediction Results</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Predictions:</div>
                  <div className="grid grid-cols-5 gap-2">
                    {mlState.predictionResults.map((pred, index) => (
                      <div key={index} className="text-center p-2 bg-white rounded border">
                        {pred}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (mlState.currentStep) {
      case 0:
        return formData.sheetId && formData.featureColumns.length > 0 && formData.labelColumn;
      case 1:
        return formData.modelType;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Machine Learning</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= mlState.currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < mlState.currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    index <= mlState.currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={mlState.currentStep === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-3">
              {mlState.currentStep < 3 && (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPanel;
