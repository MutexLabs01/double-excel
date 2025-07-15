import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterIcon, Settings, RefreshCw } from 'lucide-react';
import { ChartData, FileItem, ProjectData, SpreadsheetData } from '../types/project';
import { getColumnName } from '../utils/helpers';
import { evaluateFormula } from '../utils/formulas';

interface ChartEditorProps {
  chartData: ChartData;
  onDataUpdate: (data: ChartData) => void;
  spreadsheetFiles: FileItem[];
  projectData: ProjectData;
}

const COLORS = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#FCA5A5', '#F87171', '#EF4444'];

const ChartEditor: React.FC<ChartEditorProps> = ({
  chartData,
  onDataUpdate,
  spreadsheetFiles,
  projectData
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [localChartData, setLocalChartData] = useState<ChartData>(chartData);

  useEffect(() => {
    setLocalChartData(chartData);
  }, [chartData]);

  const updateChartData = (updates: Partial<ChartData>) => {
    const newData = { ...localChartData, ...updates };
    setLocalChartData(newData);
    onDataUpdate(newData);
  };

  const getSpreadsheetColumns = (fileId: string) => {
    const file = projectData.files[fileId];
    if (!file || file.type !== 'spreadsheet') return [];

    const data = file.data as SpreadsheetData;
    const columns = new Set<string>();
    
    Object.keys(data).forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number);
      if (row === 0) { // Header row
        columns.add(getColumnName(col));
      }
    });

    return Array.from(columns).sort();
  };

  const extractColumnData = (fileId: string, column: string, isNumeric: boolean = false) => {
    const file = projectData.files[fileId];
    if (!file || file.type !== 'spreadsheet') return [];

    const data = file.data as SpreadsheetData;
    const colIndex = column.charCodeAt(0) - 65; // Convert A, B, C to 0, 1, 2
    const values: any[] = [];

    // Start from row 1 (skip header)
    for (let row = 1; row < 100; row++) {
      const cellKey = `${row}-${colIndex}`;
      const cell = data[cellKey];
      
      if (!cell) break;
      
      let value = cell.value;
      if (cell.formula) {
        try {
          const result = evaluateFormula(cell.formula, data);
          value = result.toString();
        } catch (error) {
          continue;
        }
      }

      if (value.trim() === '') break;

      if (isNumeric) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          values.push(numValue);
        }
      } else {
        values.push(value);
      }
    }

    return values;
  };

  const refreshDataFromSource = () => {
    if (!localChartData.sourceFile || !localChartData.sourceColumns) return;

    const xData = extractColumnData(localChartData.sourceFile, localChartData.sourceColumns.x, false);
    const yData = extractColumnData(localChartData.sourceFile, localChartData.sourceColumns.y, true);

    updateChartData({
      xAxis: { ...localChartData.xAxis, data: xData },
      yAxis: { ...localChartData.yAxis, data: yData }
    });
  };

  const chartDataForRender = useMemo(() => {
    const minLength = Math.min(localChartData.xAxis.data.length, localChartData.yAxis.data.length);
    return Array.from({ length: minLength }, (_, i) => ({
      name: localChartData.xAxis.data[i],
      value: localChartData.yAxis.data[i],
      x: localChartData.xAxis.data[i],
      y: localChartData.yAxis.data[i]
    }));
  }, [localChartData.xAxis.data, localChartData.yAxis.data]);

  const renderChart = () => {
    if (chartDataForRender.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No data to display</p>
            <p className="text-sm">Configure your chart settings to get started</p>
          </div>
        </div>
      );
    }

    switch (localChartData.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartDataForRender}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartDataForRender}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartDataForRender}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartDataForRender.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartDataForRender}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter dataKey="y" fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chart Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={localChartData.title}
              onChange={(e) => updateChartData({ title: e.target.value })}
              placeholder="Chart Title"
              className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshDataFromSource}
              disabled={!localChartData.sourceFile}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Data
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </button>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm font-medium text-gray-700">Chart Type:</span>
          <div className="flex space-x-1">
            {[
              { type: 'bar', icon: BarChart3, label: 'Bar' },
              { type: 'line', icon: LineChartIcon, label: 'Line' },
              { type: 'pie', icon: PieChartIcon, label: 'Pie' },
              { type: 'scatter', icon: ScatterIcon, label: 'Scatter' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => updateChartData({ type: type as ChartData['type'] })}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  localChartData.type === type
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Chart Display */}
        <div className="flex-1 p-6">
          {renderChart()}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Settings</h3>
            
            <div className="space-y-4">
              {/* Data Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Source
                </label>
                <select
                  value={localChartData.sourceFile || ''}
                  onChange={(e) => updateChartData({ sourceFile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select spreadsheet...</option>
                  {spreadsheetFiles.map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                  ))}
                </select>
              </div>

              {localChartData.sourceFile && (
                <>
                  {/* X-Axis Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X-Axis Column
                    </label>
                    <select
                      value={localChartData.sourceColumns?.x || ''}
                      onChange={(e) => updateChartData({
                        sourceColumns: { ...localChartData.sourceColumns, x: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select column...</option>
                      {getSpreadsheetColumns(localChartData.sourceFile).map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  {/* Y-Axis Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Y-Axis Column
                    </label>
                    <select
                      value={localChartData.sourceColumns?.y || ''}
                      onChange={(e) => updateChartData({
                        sourceColumns: { ...localChartData.sourceColumns, y: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select column...</option>
                      {getSpreadsheetColumns(localChartData.sourceFile).map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Axis Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X-Axis Label
                </label>
                <input
                  type="text"
                  value={localChartData.xAxis.label}
                  onChange={(e) => updateChartData({
                    xAxis: { ...localChartData.xAxis, label: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="X-axis label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y-Axis Label
                </label>
                <input
                  type="text"
                  value={localChartData.yAxis.label}
                  onChange={(e) => updateChartData({
                    yAxis: { ...localChartData.yAxis, label: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Y-axis label"
                />
              </div>

              {/* Manual Data Entry */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Manual Data Entry</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Enter data manually (one value per line)
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      X Values
                    </label>
                    <textarea
                      value={localChartData.xAxis.data.join('\n')}
                      onChange={(e) => updateChartData({
                        xAxis: { ...localChartData.xAxis, data: e.target.value.split('\n').filter(v => v.trim()) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      rows={6}
                      placeholder="Label 1&#10;Label 2&#10;Label 3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Y Values
                    </label>
                    <textarea
                      value={localChartData.yAxis.data.join('\n')}
                      onChange={(e) => updateChartData({
                        yAxis: { ...localChartData.yAxis, data: e.target.value.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v)) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      rows={6}
                      placeholder="10&#10;20&#10;30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartEditor;