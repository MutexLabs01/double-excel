import React, { useState } from 'react';
import { ArrowLeft, Brain, BarChart3, TrendingUp, Target, Zap, Settings } from 'lucide-react';
import { ProjectData } from '../types/project';

interface MLPageProps {
  projectData: ProjectData;
  onBack: () => void;
}

const MLPage: React.FC<MLPageProps> = ({ projectData, onBack }) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const mlModels = [
    {
      id: 'regression',
      name: 'Linear Regression',
      description: 'Predict continuous values based on input features',
      icon: TrendingUp,
      color: 'blue',
      tasks: ['Predict sales', 'Forecast demand', 'Estimate prices']
    },
    {
      id: 'classification',
      name: 'Classification',
      description: 'Categorize data into predefined classes',
      icon: Target,
      color: 'green',
      tasks: ['Customer segmentation', 'Risk assessment', 'Quality control']
    },
    {
      id: 'clustering',
      name: 'Clustering',
      description: 'Group similar data points together',
      icon: BarChart3,
      color: 'purple',
      tasks: ['Customer groups', 'Product categories', 'Anomaly detection']
    },
    {
      id: 'neural',
      name: 'Neural Networks',
      description: 'Deep learning for complex pattern recognition',
      icon: Brain,
      color: 'orange',
      tasks: ['Image recognition', 'Natural language', 'Complex predictions']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Project
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Machine Learning</h1>
              <p className="text-sm text-gray-500">AI-powered data analysis and predictions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Predictions</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Training Jobs</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* ML Models Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mlModels.map((model) => {
              const IconComponent = model.icon;
              return (
                <div
                  key={model.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedModel === model.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 bg-${model.color}-100 rounded-lg`}>
                      <IconComponent className={`h-6 w-6 text-${model.color}-600`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Common Tasks:</p>
                    {model.tasks.map((task, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {task}
                      </div>
                    ))}
                  </div>
                  <button
                    className={`w-full mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedModel === model.id
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedModel === model.id ? 'Selected' : 'Select Model'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Model Configuration */}
        {selectedModel && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Configure {mlModels.find(m => m.id === selectedModel)?.name}
              </h3>
              <button
                onClick={() => setSelectedModel(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data Source
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose a spreadsheet...</option>
                  {Object.values(projectData.files)
                    .filter(f => f.type === 'spreadsheet')
                    .map(file => (
                      <option key={file.id} value={file.id}>{file.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Column
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select target column...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feature Columns
                </label>
                <div className="text-sm text-gray-500">
                  Select multiple columns to use as features
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  placeholder="Enter model name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Train Model
              </button>
            </div>
          </div>
        )}

        {/* Recent Models */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Models</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 text-center text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No models created yet</p>
              <p className="text-sm">Create your first machine learning model to get started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPage;
