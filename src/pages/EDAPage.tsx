import React from 'react';
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';
import { ProjectData } from '../types/project';

interface EDAPageProps {
  projectData: ProjectData;
  onBack: () => void;
}

const EDAPage: React.FC<EDAPageProps> = ({ projectData, onBack }) => {
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
              <h1 className="text-2xl font-bold text-gray-900">Exploratory Data Analysis</h1>
              <p className="text-sm text-gray-500">Statistical analysis and data exploration tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Data Overview Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Overview</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Files:</span>
                <span className="text-sm font-medium">{Object.keys(projectData.files).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Spreadsheets:</span>
                <span className="text-sm font-medium">
                  {Object.values(projectData.files).filter(f => f.type === 'spreadsheet').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Charts:</span>
                <span className="text-sm font-medium">
                  {Object.values(projectData.files).filter(f => f.type === 'chart').length}
                </span>
              </div>
            </div>
          </div>

          {/* Statistical Analysis Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Statistical Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Perform descriptive statistics, correlation analysis, and hypothesis testing on your data.
            </p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Start Analysis
            </button>
          </div>

          {/* Data Visualization Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <PieChart className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Visualization</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Create interactive visualizations to explore patterns and relationships in your data.
            </p>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              Create Visualizations
            </button>
          </div>

          {/* Time Series Analysis Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Time Series Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Analyze temporal patterns, trends, and seasonality in your time-series data.
            </p>
            <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
              Analyze Time Series
            </button>
          </div>

          {/* Data Quality Assessment Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Quality</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Assess data quality, identify missing values, outliers, and inconsistencies.
            </p>
            <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
              Check Data Quality
            </button>
          </div>

          {/* Correlation Analysis Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Correlation Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Discover relationships and correlations between different variables in your dataset.
            </p>
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Analyze Correlations
            </button>
          </div>
        </div>

        {/* Recent Files Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Files</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(projectData.files)
                    .sort((a, b) => b.modifiedAt - a.modifiedAt)
                    .slice(0, 5)
                    .map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {file.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {file.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(file.modifiedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900">
                            Analyze
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EDAPage;
