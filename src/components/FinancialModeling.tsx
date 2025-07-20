import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Settings, 
  Download, 
  Upload,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileText,
  DollarSign,
  Percent,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Shield,
  BookOpen,
  Users,
  Clock,
  Save,
  RefreshCw,
  Filter,
  Search,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Share,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  FinancialModel, 
  FinancialSheet,
  FinancialCell,
  DCFModel, 
  SensitivityAnalysis, 
  BudgetModel,
  InvestmentAnalysis,
  MonteCarloSimulation,
  ValidationError,
  FinancialFormula
} from '../types/financial';

interface FinancialModelingProps {
  onSave: (model: FinancialModel) => void;
  onLoad?: (model: FinancialModel) => void;
  initialModel?: FinancialModel;
}

const FinancialModeling: React.FC<FinancialModelingProps> = ({ onSave, onLoad, initialModel }) => {
  const [model, setModel] = useState<FinancialModel | null>(initialModel || null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'model' | 'assumptions' | 'calculations' | 'scenarios' | 'validation' | 'outputs' | 'audit'>('model');
  const [showFormulas, setShowFormulas] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize model if none exists
  useEffect(() => {
    if (!model) {
      const newModel: FinancialModel = {
        id: generateId(),
        name: 'New Financial Model',
        description: '',
        version: '1.0.0',
        author: 'User',
        category: 'custom',
        sheets: {},
        sheetOrder: [],
        assumptions: {},
        calculations: {},
        scenarios: {},
        validations: {},
        outputs: {},
        auditTrail: {},
        settings: {
          currency: 'USD',
          decimalPlaces: 2,
          dateFormat: 'MM/DD/YYYY',
          timeZone: 'UTC',
          autoCalculate: true,
          autoValidate: true,
          showFormulas: false,
          showDependencies: false,
          enableVersioning: true
        },
        tags: [],
        createdAt: Date.now(),
        modifiedAt: Date.now()
      };
      setModel(newModel);
    }
  }, [model]);

  // Auto-calculate when assumptions change
  useEffect(() => {
    if (autoCalculate && model) {
      calculateModel();
    }
  }, [model?.assumptions, autoCalculate]);

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const calculateModel = useCallback(async () => {
    if (!model) return;
    
    setIsCalculating(true);
    try {
      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update model with calculation results
      const updatedModel = { ...model };
      updatedModel.lastCalculated = Date.now();
      updatedModel.modifiedAt = Date.now();
      
      // Add to audit trail
      const auditEntry = {
        id: generateId(),
        timestamp: Date.now(),
        user: 'User',
        action: 'calculate' as const,
        details: 'Model recalculated',
        affectedCells: Object.keys(model.sheets).flatMap(sheetId => 
          Object.keys(model.sheets[sheetId].data)
        )
      };
      
      updatedModel.auditTrail[auditEntry.id] = auditEntry;
      
      setModel(updatedModel);
      onSave(updatedModel);
    } catch (error) {
      console.error('Calculation error:', error);
      addValidationError({
        id: generateId(),
        type: 'error',
        message: 'Calculation failed: ' + error,
        severity: 'critical',
        isResolved: false
      });
    } finally {
      setIsCalculating(false);
    }
  }, [model, onSave]);

  const addValidationError = (error: ValidationError) => {
    setValidationErrors(prev => [...prev, error]);
  };

  const resolveValidationError = (errorId: string) => {
    setValidationErrors(prev => 
      prev.map(error => 
        error.id === errorId 
          ? { ...error, isResolved: true, resolvedBy: 'User', resolvedAt: Date.now() }
          : error
      )
    );
  };

  const createSheet = (name: string, type: FinancialSheet['type']) => {
    if (!model) return;
    
    // Initialize with some default cells
    const defaultData: { [cellId: string]: FinancialCell } = {};
    
    // Create header row (row 0)
    for (let col = 0; col < 10; col++) {
      defaultData[`0-${col}`] = {
        value: `Column ${col + 1}`,
        formula: null,
        format: 'text',
        isCalculated: false,
        notes: 'Header cell'
      };
    }
    
    // Create some sample data cells
    for (let row = 1; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        defaultData[`${row}-${col}`] = {
          value: row === 1 ? `Row ${row}` : 0,
          formula: null,
          format: row === 1 ? 'text' : 'number',
          isCalculated: false
        };
      }
    }
    
    const newSheet: FinancialSheet = {
      id: generateId(),
      name,
      type,
      data: defaultData,
      layout: {
        rows: 50,
        columns: 20,
        frozenRows: 1,
        frozenColumns: 1,
        columnHeaders: [],
        rowHeaders: []
      },
      formulas: {},
      validation: {},
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };
    
    const updatedModel = { ...model };
    updatedModel.sheets[newSheet.id] = newSheet;
    updatedModel.sheetOrder.push(newSheet.id);
    
    setModel(updatedModel);
    setActiveSheet(newSheet.id);
  };

  const updateCell = (sheetId: string, cellId: string, updates: Partial<FinancialCell>) => {
    if (!model) return;
    
    const updatedModel = { ...model };
    const sheet = updatedModel.sheets[sheetId];
    
    if (sheet) {
      const currentCell = sheet.data[cellId] || {
        value: 0,
        formula: null,
        format: 'number',
        isCalculated: false
      };
      
      sheet.data[cellId] = { ...currentCell, ...updates };
      sheet.modifiedAt = Date.now();
      updatedModel.modifiedAt = Date.now();
      
      setModel(updatedModel);
    }
  };

  const addAssumption = () => {
    if (!model) return;
    
    const newAssumption = {
      id: generateId(),
      name: 'New Assumption',
      value: 0,
      unit: '',
      description: '',
      category: 'other',
      isVariable: false,
      lastUpdated: Date.now(),
      updatedBy: 'User'
    };
    
    const updatedModel = { ...model };
    updatedModel.assumptions[newAssumption.id] = newAssumption;
    updatedModel.modifiedAt = Date.now();
    
    setModel(updatedModel);
  };

  const updateAssumption = (assumptionId: string, updates: any) => {
    if (!model) return;
    
    const updatedModel = { ...model };
    if (updatedModel.assumptions[assumptionId]) {
      updatedModel.assumptions[assumptionId] = {
        ...updatedModel.assumptions[assumptionId],
        ...updates,
        lastUpdated: Date.now(),
        updatedBy: 'User'
      };
      updatedModel.modifiedAt = Date.now();
      setModel(updatedModel);
    }
  };

  const addCalculation = () => {
    if (!model) return;
    
    const newCalculation = {
      id: generateId(),
      name: 'New Calculation',
      description: '',
      formula: '',
      inputs: [],
      outputs: [],
      category: 'custom',
      isActive: true
    };
    
    const updatedModel = { ...model };
    updatedModel.calculations[newCalculation.id] = newCalculation;
    updatedModel.modifiedAt = Date.now();
    
    setModel(updatedModel);
  };

  const addScenario = () => {
    if (!model) return;
    
    const newScenario = {
      id: generateId(),
      name: 'New Scenario',
      description: '',
      assumptions: {},
      isActive: true,
      createdAt: Date.now()
    };
    
    const updatedModel = { ...model };
    updatedModel.scenarios[newScenario.id] = newScenario;
    updatedModel.modifiedAt = Date.now();
    
    setModel(updatedModel);
  };

  const addValidation = () => {
    if (!model) return;
    
    const newValidation = {
      id: generateId(),
      name: 'New Validation Rule',
      description: '',
      rule: '',
      severity: 'warning' as const,
      affectedCells: [],
      isActive: true
    };
    
    const updatedModel = { ...model };
    updatedModel.validations[newValidation.id] = newValidation;
    updatedModel.modifiedAt = Date.now();
    
    setModel(updatedModel);
  };

  const renderModelView = () => (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={calculateModel}
              disabled={isCalculating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isCalculating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
              <span>{isCalculating ? 'Calculating...' : 'Calculate'}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showFormulas}
                  onChange={(e) => setShowFormulas(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Formulas</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showDependencies}
                  onChange={(e) => setShowDependencies(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Dependencies</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoCalculate}
                  onChange={(e) => setAutoCalculate(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Auto Calculate</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-1 px-4 py-2 overflow-x-auto">
          {model?.sheetOrder.map(sheetId => {
            const sheet = model.sheets[sheetId];
            return (
              <button
                key={sheetId}
                onClick={() => setActiveSheet(sheetId)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  activeSheet === sheetId
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {sheet.name}
              </button>
            );
          })}
          
          <button
            onClick={() => {
              const name = prompt('Enter sheet name:');
              if (name) createSheet(name, 'custom');
            }}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sheet Content */}
      <div className="flex-1 overflow-auto">
        {activeSheet && model?.sheets[activeSheet] ? (
          <div className="p-4">
            <FinancialSheetEditor
              sheet={model.sheets[activeSheet]}
              onUpdate={(updates) => {
                if (model) {
                  const updatedModel = { ...model };
                  updatedModel.sheets[activeSheet] = { ...updatedModel.sheets[activeSheet], ...updates };
                  setModel(updatedModel);
                }
              }}
              showFormulas={showFormulas}
              showDependencies={showDependencies}
              selectedCells={selectedCells}
              onCellSelect={setSelectedCells}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>No sheet selected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAssumptionsView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Assumptions</h3>
        <button
          onClick={addAssumption}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assumption</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {model && Object.entries(model.assumptions).map(([id, assumption]) => (
          <div key={id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={assumption.name}
                onChange={(e) => updateAssumption(id, { name: e.target.value })}
                className="text-lg font-medium border-none focus:outline-none focus:ring-0"
              />
              <button className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="number"
                  value={assumption.value}
                  onChange={(e) => updateAssumption(id, { value: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={assumption.unit}
                  onChange={(e) => updateAssumption(id, { unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={assumption.description}
                  onChange={(e) => updateAssumption(id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={assumption.isVariable}
                    onChange={(e) => updateAssumption(id, { isVariable: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Variable for sensitivity</span>
                </label>
              </div>
              
              {assumption.isVariable && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      value={assumption.minValue || ''}
                      onChange={(e) => updateAssumption(id, { minValue: parseFloat(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      value={assumption.maxValue || ''}
                      onChange={(e) => updateAssumption(id, { maxValue: parseFloat(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Step</label>
                    <input
                      type="number"
                      value={assumption.step || ''}
                      onChange={(e) => updateAssumption(id, { step: parseFloat(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalculationsView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Calculations</h3>
        <button
          onClick={addCalculation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Calculation</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {model && Object.entries(model.calculations).map(([id, calculation]) => (
          <div key={id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={calculation.name}
                onChange={(e) => {
                  if (model) {
                    const updatedModel = { ...model };
                    updatedModel.calculations[id].name = e.target.value;
                    setModel(updatedModel);
                  }
                }}
                className="text-lg font-medium border-none focus:outline-none focus:ring-0"
              />
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={calculation.isActive}
                    onChange={(e) => {
                      if (model) {
                        const updatedModel = { ...model };
                        updatedModel.calculations[id].isActive = e.target.checked;
                        setModel(updatedModel);
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                <textarea
                  value={calculation.formula}
                  onChange={(e) => {
                    if (model) {
                      const updatedModel = { ...model };
                      updatedModel.calculations[id].formula = e.target.value;
                      setModel(updatedModel);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                  rows={3}
                  placeholder="Enter formula..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={calculation.description}
                  onChange={(e) => {
                    if (model) {
                      const updatedModel = { ...model };
                      updatedModel.calculations[id].description = e.target.value;
                      setModel(updatedModel);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScenariosView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Scenarios</h3>
        <button
          onClick={addScenario}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Scenario</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {model && Object.entries(model.scenarios).map(([id, scenario]) => (
          <div key={id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={scenario.name}
                onChange={(e) => {
                  if (model) {
                    const updatedModel = { ...model };
                    updatedModel.scenarios[id].name = e.target.value;
                    setModel(updatedModel);
                  }
                }}
                className="text-lg font-medium border-none focus:outline-none focus:ring-0"
              />
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scenario.isActive}
                    onChange={(e) => {
                      if (model) {
                        const updatedModel = { ...model };
                        updatedModel.scenarios[id].isActive = e.target.checked;
                        setModel(updatedModel);
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={scenario.description}
                  onChange={(e) => {
                    if (model) {
                      const updatedModel = { ...model };
                      updatedModel.scenarios[id].description = e.target.value;
                      setModel(updatedModel);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assumptions</label>
                <div className="space-y-2">
                  {model && Object.entries(model.assumptions).map(([assumptionId, assumption]) => (
                    <div key={assumptionId} className="flex items-center space-x-2">
                      <span className="text-sm w-32">{assumption.name}:</span>
                      <input
                        type="number"
                        value={scenario.assumptions[assumptionId] || assumption.value}
                        onChange={(e) => {
                          if (model) {
                            const updatedModel = { ...model };
                            updatedModel.scenarios[id].assumptions[assumptionId] = parseFloat(e.target.value);
                            setModel(updatedModel);
                          }
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderValidationView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Validation Rules</h3>
        <button
          onClick={addValidation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Validation</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {model && Object.entries(model.validations).map(([id, validation]) => (
          <div key={id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={validation.name}
                onChange={(e) => {
                  if (model) {
                    const updatedModel = { ...model };
                    updatedModel.validations[id].name = e.target.value;
                    setModel(updatedModel);
                  }
                }}
                className="text-lg font-medium border-none focus:outline-none focus:ring-0"
              />
              <div className="flex items-center space-x-2">
                <select
                  value={validation.severity}
                  onChange={(e) => {
                    if (model) {
                      const updatedModel = { ...model };
                      updatedModel.validations[id].severity = e.target.value as any;
                      setModel(updatedModel);
                    }
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={validation.isActive}
                    onChange={(e) => {
                      if (model) {
                        const updatedModel = { ...model };
                        updatedModel.validations[id].isActive = e.target.checked;
                        setModel(updatedModel);
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule</label>
                <textarea
                  value={validation.rule}
                  onChange={(e) => {
                    if (model) {
                      const updatedModel = { ...model };
                      updatedModel.validations[id].rule = e.target.value;
                      setModel(updatedModel);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                  rows={2}
                  placeholder="Enter validation rule..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={validation.description}
                  onChange={(e) => {
                    if (model) {
                      const updatedModel = { ...model };
                      updatedModel.validations[id].description = e.target.value;
                      setModel(updatedModel);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOutputsView = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-6">Outputs & KPIs</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {model && Object.entries(model.outputs).map(([id, output]) => (
          <div key={id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">{output.name}</h4>
              {output.isKPI && <Target className="w-4 h-4 text-blue-600" />}
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {output.format === 'currency' && '$'}
                {output.value}
                {output.format === 'percentage' && '%'}
                {output.unit && ` ${output.unit}`}
              </div>
              
              {output.isKPI && output.target && (
                <div className="flex items-center justify-between text-sm">
                  <span>Target: {output.target}</span>
                  <span className={output.variance && output.variance > 0 ? 'text-green-600' : 'text-red-600'}>
                    {output.variancePercent}%
                  </span>
                </div>
              )}
              
              <p className="text-sm text-gray-600">{output.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditView = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-6">Audit Trail</h3>
      
      <div className="space-y-3">
        {model && Object.entries(model.auditTrail).map(([id, entry]) => (
          <div key={id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  entry.action === 'create' ? 'bg-green-500' :
                  entry.action === 'update' ? 'bg-blue-500' :
                  entry.action === 'delete' ? 'bg-red-500' :
                  entry.action === 'calculate' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <span className="font-medium">{entry.action}</span>
                <span className="text-sm text-gray-600">{entry.details}</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!model) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={model.name}
              onChange={(e) => {
                const updatedModel = { ...model, name: e.target.value };
                setModel(updatedModel);
              }}
              className="text-2xl font-bold border-none focus:outline-none focus:ring-0"
            />
            <textarea
              value={model.description}
              onChange={(e) => {
                const updatedModel = { ...model, description: e.target.value };
                setModel(updatedModel);
              }}
              className="text-sm text-gray-600 border-none focus:outline-none focus:ring-0 resize-none"
              rows={1}
              placeholder="Model description..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSave(model)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'model', name: 'Model', icon: Grid },
            { id: 'assumptions', name: 'Assumptions', icon: Settings },
            { id: 'calculations', name: 'Calculations', icon: Calculator },
            { id: 'scenarios', name: 'Scenarios', icon: TrendingUp },
            { id: 'validation', name: 'Validation', icon: Shield },
            { id: 'outputs', name: 'Outputs', icon: Target },
            { id: 'audit', name: 'Audit', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'model' && renderModelView()}
        {activeTab === 'assumptions' && renderAssumptionsView()}
        {activeTab === 'calculations' && renderCalculationsView()}
        {activeTab === 'scenarios' && renderScenariosView()}
        {activeTab === 'validation' && renderValidationView()}
        {activeTab === 'outputs' && renderOutputsView()}
        {activeTab === 'audit' && renderAuditView()}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-red-800">Validation Errors</h4>
            <button
              onClick={() => setValidationErrors([])}
              className="text-red-600 hover:text-red-800"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {validationErrors.map((error) => (
              <div key={error.id} className="flex items-center justify-between p-2 bg-red-100 rounded">
                <span className="text-sm text-red-800">{error.message}</span>
                {!error.isResolved && (
                  <button
                    onClick={() => resolveValidationError(error.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Financial Sheet Editor Component
interface FinancialSheetEditorProps {
  sheet: FinancialSheet;
  onUpdate: (updates: Partial<FinancialSheet>) => void;
  showFormulas: boolean;
  showDependencies: boolean;
  selectedCells: string[];
  onCellSelect: (cells: string[]) => void;
}

const FinancialSheetEditor: React.FC<FinancialSheetEditorProps> = ({
  sheet,
  onUpdate,
  showFormulas,
  showDependencies,
  selectedCells,
  onCellSelect
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellClick = (cellId: string) => {
    onCellSelect([cellId]);
  };

  const handleCellDoubleClick = (cellId: string) => {
    const cell = sheet.data[cellId];
    setEditingCell(cellId);
    setEditValue(cell?.formula || cell?.value?.toString() || '');
  };

  const handleCellEdit = (cellId: string, value: string) => {
    const cell = sheet.data[cellId];
    
    // Determine if it's a formula or value
    const isFormula = value.startsWith('=');
    const isNumber = !isNaN(parseFloat(value)) && value.trim() !== '';
    
    const updatedCell: FinancialCell = {
      value: isFormula ? 0 : (isNumber ? parseFloat(value) : value),
      formula: isFormula ? value : null,
      format: isFormula ? 'number' : (isNumber ? 'number' : 'text'),
      isCalculated: isFormula,
      notes: cell?.notes,
      color: cell?.color,
      dependencies: cell?.dependencies,
      dependents: cell?.dependents
    };

    const updatedData = { ...sheet.data, [cellId]: updatedCell };
    onUpdate({ data: updatedData });
    setEditingCell(null);
  };

  const renderCell = (cellId: string) => {
    const cell = sheet.data[cellId];
    const [row, col] = cellId.split('-').map(Number);
    const isSelected = selectedCells.includes(cellId);
    const isEditing = editingCell === cellId;

    // Create default cell if it doesn't exist
    const defaultCell: FinancialCell = {
      value: '',
      formula: null,
      format: 'text',
      isCalculated: false
    };

    const currentCell = cell || defaultCell;

    return (
      <div
        key={cellId}
        className={`border border-gray-200 p-2 min-h-[40px] flex items-center ${
          isSelected ? 'bg-blue-100 border-blue-300' : ''
        } ${currentCell.isCalculated ? 'bg-green-50' : ''} ${
          !cell ? 'bg-gray-50' : ''
        }`}
        onClick={() => handleCellClick(cellId)}
        onDoubleClick={() => handleCellDoubleClick(cellId)}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellEdit(cellId, editValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellEdit(cellId, editValue);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full border-none focus:outline-none focus:ring-0"
            autoFocus
          />
        ) : (
          <div className="w-full">
            {showFormulas && currentCell.formula ? (
              <div className="text-sm font-mono text-blue-600">{currentCell.formula}</div>
            ) : (
              <div className={`${
                currentCell.format === 'currency' ? 'text-green-600' :
                currentCell.format === 'percentage' ? 'text-blue-600' :
                currentCell.format === 'text' ? 'text-gray-900' :
                'text-gray-600'
              }`}>
                {currentCell.format === 'currency' && currentCell.value && '$'}
                {currentCell.value || ''}
                {currentCell.format === 'percentage' && currentCell.value && '%'}
              </div>
            )}
            {showDependencies && currentCell.dependencies && currentCell.dependencies.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Depends on: {currentCell.dependencies.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{sheet.name}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {Object.keys(sheet.data).length} cells populated
          </span>
          <span className="text-sm text-gray-500">
            ({sheet.layout.rows} × {sheet.layout.columns} grid)
          </span>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: Math.min(sheet.layout.rows, 20) }, (_, row) =>
            Array.from({ length: Math.min(sheet.layout.columns, 10) }, (_, col) => {
              const cellId = `${row}-${col}`;
              return renderCell(cellId);
            })
          )}
        </div>
        {sheet.layout.rows > 20 || sheet.layout.columns > 10 && (
          <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
            Showing first 20 rows × 10 columns. Click cells to expand.
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialModeling; 