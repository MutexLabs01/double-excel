import React, { useState } from 'react';
import { X, Upload, Database, Globe, Zap, FileText, Loader2 } from 'lucide-react';
import { ImportConfig, importData, ImportResult } from '../utils/import';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[][], columns?: string[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [importType, setImportType] = useState<'file' | 'sql' | 'mongodb' | 'api' | 'synthetic'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // SQL configuration
  const [sqlConfig, setSqlConfig] = useState({
    endpoint: '',
    tableName: '',
    limit: 100,
    columns: ''
  });
  
  // MongoDB configuration
  const [mongodbConfig, setMongodbConfig] = useState({
    endpoint: '',
    collectionName: '',
    limit: 100,
    columns: ''
  });
  
  // API configuration
  const [apiConfig, setApiConfig] = useState({
    url: '',
    dataField: '',
    fields: ''
  });
  
  // Synthetic data configuration
  const [syntheticConfig, setSyntheticConfig] = useState({
    prompt: '',
    limit: 100
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);

    try {
      let config: ImportConfig;
      
      switch (importType) {
        case 'file':
          if (!selectedFile) {
            setError('Please select a file');
            return;
          }
          config = {
            type: 'file',
            file: selectedFile
          };
          break;
          
        case 'sql':
          if (!sqlConfig.endpoint || !sqlConfig.tableName) {
            setError('Please fill in all required SQL fields');
            return;
          }
          config = {
            type: 'sql',
            sqlConfig: {
              endpoint: sqlConfig.endpoint,
              tableName: sqlConfig.tableName,
              limit: sqlConfig.limit,
              columns: sqlConfig.columns.split(',').map(col => col.trim()).filter(col => col)
            }
          };
          break;
          
        case 'mongodb':
          if (!mongodbConfig.endpoint || !mongodbConfig.collectionName) {
            setError('Please fill in all required MongoDB fields');
            return;
          }
          config = {
            type: 'mongodb',
            mongodbConfig: {
              endpoint: mongodbConfig.endpoint,
              collectionName: mongodbConfig.collectionName,
              limit: mongodbConfig.limit,
              columns: mongodbConfig.columns.split(',').map(col => col.trim()).filter(col => col)
            }
          };
          break;
          
        case 'api':
          if (!apiConfig.url || !apiConfig.dataField) {
            setError('Please fill in all required API fields');
            return;
          }
          config = {
            type: 'api',
            apiConfig: {
              url: apiConfig.url,
              dataField: apiConfig.dataField,
              fields: apiConfig.fields.split(',').map(field => field.trim()).filter(field => field)
            }
          };
          break;
          
        case 'synthetic':
          if (!syntheticConfig.prompt) {
            setError('Please enter a prompt for synthetic data generation');
            return;
          }
          config = {
            type: 'synthetic',
            syntheticConfig: {
              prompt: syntheticConfig.prompt,
              limit: syntheticConfig.limit
            }
          };
          break;
          
        default:
          setError('Invalid import type');
          return;
      }

      const result: ImportResult = await importData(config);
      console.log('Import result:', result);
      
      if (result.success) {
        console.log('Calling onImport with:', { data: result.data, columns: result.columns });
        onImport(result.data, result.columns);
        onClose();
      } else {
        setError(result.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImportType('file');
    setSelectedFile(null);
    setSqlConfig({ endpoint: '', tableName: '', limit: 100, columns: '' });
    setMongodbConfig({ endpoint: '', collectionName: '', limit: 100, columns: '' });
    setApiConfig({ url: '', dataField: '', fields: '' });
    setSyntheticConfig({ prompt: '', limit: 100 });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Helper function to get input props with loading state
  const getInputProps = (additionalProps: any = {}) => ({
    disabled: loading,
    className: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`,
    ...additionalProps
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Import Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Import Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { type: 'file', label: 'Upload File', icon: Upload },
              { type: 'sql', label: 'SQL Database', icon: Database },
              { type: 'mongodb', label: 'MongoDB', icon: Database },
              { type: 'api', label: 'API Endpoint', icon: Globe },
              { type: 'synthetic', label: 'Synthetic Data', icon: Zap }
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setImportType(type as any)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  importType === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon size={20} className="mx-auto mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        {importType === 'file' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (CSV or XLSX)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText size={48} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Click to select file'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* SQL Configuration */}
        {importType === 'sql' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SQL Endpoint *
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: sqlConfig.endpoint,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSqlConfig({ ...sqlConfig, endpoint: e.target.value }),
                  placeholder: "postgresql://user:password@localhost:5432/database"
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Name *
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: sqlConfig.tableName,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSqlConfig({ ...sqlConfig, tableName: e.target.value }),
                  placeholder: "users"
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <input
                {...getInputProps({
                  type: "number",
                  value: sqlConfig.limit,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSqlConfig({ ...sqlConfig, limit: parseInt(e.target.value) || 100 })
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Column Names (comma-separated)
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: sqlConfig.columns,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSqlConfig({ ...sqlConfig, columns: e.target.value }),
                  placeholder: "id, name, email, created_at"
                })}
              />
            </div>
          </div>
        )}

        {/* MongoDB Configuration */}
        {importType === 'mongodb' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MongoDB Endpoint *
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: mongodbConfig.endpoint,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMongodbConfig({ ...mongodbConfig, endpoint: e.target.value }),
                  placeholder: "mongodb://localhost:27017/database"
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Name *
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: mongodbConfig.collectionName,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMongodbConfig({ ...mongodbConfig, collectionName: e.target.value }),
                  placeholder: "users"
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <input
                {...getInputProps({
                  type: "number",
                  value: mongodbConfig.limit,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMongodbConfig({ ...mongodbConfig, limit: parseInt(e.target.value) || 100 })
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Names (comma-separated)
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: mongodbConfig.columns,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMongodbConfig({ ...mongodbConfig, columns: e.target.value }),
                  placeholder: "_id, name, email, createdAt"
                })}
              />
            </div>
          </div>
        )}

        {/* API Configuration */}
        {importType === 'api' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API URL *
              </label>
              <input
                {...getInputProps({
                  type: "url",
                  value: apiConfig.url,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setApiConfig({ ...apiConfig, url: e.target.value }),
                  placeholder: "https://api.example.com/data"
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Field Path *
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: apiConfig.dataField,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setApiConfig({ ...apiConfig, dataField: e.target.value }),
                  placeholder: "data.results"
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fields to Extract (comma-separated)
              </label>
              <input
                {...getInputProps({
                  type: "text",
                  value: apiConfig.fields,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setApiConfig({ ...apiConfig, fields: e.target.value }),
                  placeholder: "id, name, email, status"
                })}
              />
            </div>
          </div>
        )}

        {/* Synthetic Data Configuration */}
        {importType === 'synthetic' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt *
              </label>
              <textarea
                {...getInputProps({
                  value: syntheticConfig.prompt,
                  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSyntheticConfig({ ...syntheticConfig, prompt: e.target.value }),
                  placeholder: "Generate a dataset of customer information including name, email, age, and purchase history...",
                  rows: 4
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rows
              </label>
              <input
                {...getInputProps({
                  type: "number",
                  value: syntheticConfig.limit,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSyntheticConfig({ ...syntheticConfig, limit: parseInt(e.target.value) || 100 })
                })}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Processing your request...</p>
                <p className="text-xs text-blue-600">
                  {importType === 'file' && 'Reading and parsing file...'}
                  {importType === 'sql' && 'Connecting to database and fetching data...'}
                  {importType === 'mongodb' && 'Connecting to MongoDB and fetching data...'}
                  {importType === 'api' && 'Fetching data from API endpoint...'}
                  {importType === 'synthetic' && 'Generating synthetic data with AI...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? 'Importing...' : 'Import Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
