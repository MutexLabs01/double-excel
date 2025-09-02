export interface MLColumn {
  id: string;
  name: string;
  type: 'feature' | 'label';
  dataType: 'numeric' | 'categorical' | 'text';
}

export interface MLModel {
  id: string;
  name: string;
  type: 'logistic_regression' | 'random_forest';
  displayName: string;
  description: string;
}

export interface TrainRequest {
  X: number[][];
  y: number[];
  model_name: string;
}

export interface PredictRequest {
  X_new: number[][];
  model_path: string;
}

export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface TrainResponse {
  metrics: MLMetrics;
  model_file: string;
}

export interface PredictResponse {
  predictions: number[];
}

export interface MLState {
  selectedSheet: string | null;
  featureColumns: MLColumn[];
  labelColumn: MLColumn | null;
  selectedModel: MLModel | null;
  isTraining: boolean;
  isPredicting: boolean;
  trainingMetrics: MLMetrics | null;
  modelPath: string | null;
  predictionResults: number[] | null;
  currentStep: number;
  hyperparameters: Record<string, any>;
  dataPreview: any[];
  showDataPreview: boolean;
  showHyperparameters: boolean;
  showMetrics: boolean;
  showPrediction: boolean;
}

export interface MLFormData {
  sheetId: string;
  featureColumns: string[];
  labelColumn: string;
  modelType: string;
}
