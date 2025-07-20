// Core financial modeling structures
export interface FinancialCell {
  value: number | string;
  formula: string | null;
  format: 'currency' | 'percentage' | 'number' | 'text' | 'date';
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
    custom?: string; // Custom validation rule
  };
  notes?: string;
  color?: string;
  isCalculated: boolean;
  dependencies?: string[]; // Cells this depends on
  dependents?: string[]; // Cells that depend on this
}

export interface FinancialSheet {
  id: string;
  name: string;
  type: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'assumptions' | 'calculations' | 'outputs' | 'custom';
  data: { [cellId: string]: FinancialCell };
  layout: {
    rows: number;
    columns: number;
    frozenRows?: number;
    frozenColumns?: number;
    columnHeaders?: string[];
    rowHeaders?: string[];
  };
  formulas: {
    [formulaId: string]: {
      name: string;
      description: string;
      formula: string;
      category: 'financial' | 'statistical' | 'custom';
      parameters: string[];
      examples: string[];
    };
  };
  validation: {
    [ruleId: string]: {
      name: string;
      description: string;
      cells: string[];
      rule: string;
      errorMessage: string;
    };
  };
  createdAt: number;
  modifiedAt: number;
}

export interface FinancialModel {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'valuation' | 'budgeting' | 'forecasting' | 'investment' | 'custom';
  
  // Flexible structure
  sheets: { [sheetId: string]: FinancialSheet };
  sheetOrder: string[];
  
  // Dynamic assumptions
  assumptions: {
    [assumptionId: string]: {
      name: string;
      value: number | string;
      unit: string;
      description: string;
      category: string;
      isVariable: boolean;
      minValue?: number;
      maxValue?: number;
      step?: number;
      distribution?: 'normal' | 'uniform' | 'triangular' | 'lognormal';
      confidence?: number; // For Monte Carlo
      source?: string; // Where this assumption comes from
      lastUpdated: number;
      updatedBy: string;
    };
  };
  
  // Flexible calculations
  calculations: {
    [calcId: string]: {
      name: string;
      description: string;
      formula: string;
      inputs: string[];
      outputs: string[];
      category: string;
      isActive: boolean;
    };
  };
  
  // Dynamic scenarios
  scenarios: {
    [scenarioId: string]: {
      name: string;
      description: string;
      assumptions: { [assumptionId: string]: number | string };
      isActive: boolean;
      createdAt: number;
    };
  };
  
  // Validation rules
  validations: {
    [validationId: string]: {
      name: string;
      description: string;
      rule: string;
      severity: 'error' | 'warning' | 'info';
      affectedCells: string[];
      isActive: boolean;
    };
  };
  
  // Outputs and KPIs
  outputs: {
    [outputId: string]: {
      name: string;
      description: string;
      value: number | string;
      unit: string;
      category: string;
      sourceCell: string;
      format: 'currency' | 'percentage' | 'number' | 'text';
      isKPI: boolean;
      target?: number;
      actual?: number;
      variance?: number;
      variancePercent?: number;
    };
  };
  
  // Audit trail
  auditTrail: {
    [entryId: string]: {
      timestamp: number;
      user: string;
      action: 'create' | 'update' | 'delete' | 'calculate' | 'validate';
      details: string;
      affectedCells?: string[];
    };
  };
  
  // Model settings
  settings: {
    currency: string;
    decimalPlaces: number;
    dateFormat: string;
    timeZone: string;
    autoCalculate: boolean;
    autoValidate: boolean;
    showFormulas: boolean;
    showDependencies: boolean;
    enableVersioning: boolean;
  };
  
  // Metadata
  tags: string[];
  createdAt: number;
  modifiedAt: number;
  lastCalculated?: number;
  lastValidated?: number;
}

// Enhanced DCF with flexibility
export interface DCFModel {
  id: string;
  name: string;
  description: string;
  
  // Flexible period structure
  periods: {
    [periodId: string]: {
      name: string;
      year: number;
      quarter?: number;
      month?: number;
      isHistorical: boolean;
      isProjection: boolean;
      isTerminal: boolean;
    };
  };
  
  // Dynamic cash flow structure
  cashFlows: {
    [periodId: string]: {
      [lineItemId: string]: {
        name: string;
        value: number;
        formula: string | null;
        category: 'revenue' | 'cost' | 'expense' | 'investment' | 'financing' | 'other';
        isCalculated: boolean;
        assumptions: string[];
        notes?: string;
      };
    };
  };
  
  // Flexible assumptions
  assumptions: {
    [assumptionId: string]: {
      name: string;
      value: number;
      unit: string;
      description: string;
      category: string;
      isVariable: boolean;
      minValue?: number;
      maxValue?: number;
      step?: number;
      distribution?: 'normal' | 'uniform' | 'triangular' | 'lognormal';
      confidence?: number;
      source?: string;
    };
  };
  
  // Valuation results
  valuation: {
    enterpriseValue: number;
    equityValue: number;
    presentValue: number;
    terminalValue: number;
    discountRate: number;
    terminalGrowthRate: number;
    irr?: number;
    npv?: number;
    paybackPeriod?: number;
  };
  
  // Sensitivity analysis
  sensitivity: {
    [variableId: string]: {
      variable: string;
      baseValue: number;
      minValue: number;
      maxValue: number;
      impact: number;
      scenarios: {
        [scenarioId: string]: {
          value: number;
          enterpriseValue: number;
          equityValue: number;
          irr?: number;
          npv?: number;
        };
      };
    };
  };
  
  createdAt: number;
  modifiedAt: number;
}

// Enhanced sensitivity analysis
export interface SensitivityAnalysis {
  id: string;
  name: string;
  description: string;
  
  // Base case
  baseCase: {
    assumptions: { [key: string]: number };
    results: {
      enterpriseValue: number;
      equityValue: number;
      irr?: number;
      npv?: number;
      paybackPeriod?: number;
    };
  };
  
  // Scenarios
  scenarios: {
    [scenarioId: string]: {
      name: string;
      description: string;
      assumptions: { [key: string]: number };
      results: {
        enterpriseValue: number;
        equityValue: number;
        irr?: number;
        npv?: number;
        paybackPeriod?: number;
      };
      probability?: number;
    };
  };
  
  // Tornado chart data
  tornadoChart: {
    variable: string;
    impact: number;
    direction: 'positive' | 'negative';
    scenarios: {
      min: { value: number; result: number };
      max: { value: number; result: number };
    };
  }[];
  
  // Spider chart data
  spiderChart: {
    variables: string[];
    scenarios: {
      [scenarioId: string]: {
        name: string;
        values: number[];
      };
    };
  };
  
  createdAt: number;
  modifiedAt: number;
}

// Enhanced Monte Carlo simulation
export interface MonteCarloSimulation {
  id: string;
  name: string;
  description: string;
  
  // Simulation parameters
  parameters: {
    iterations: number;
    seed?: number;
    confidenceLevel: number;
    convergenceCriteria: number;
  };
  
  // Variable distributions
  variables: {
    [variableId: string]: {
      name: string;
      distribution: 'normal' | 'uniform' | 'triangular' | 'lognormal' | 'exponential' | 'custom';
      parameters: {
        mean?: number;
        standardDeviation?: number;
        min?: number;
        max?: number;
        mode?: number;
        lambda?: number;
        customFormula?: string;
      };
      correlation?: { [otherVariable: string]: number };
    };
  };
  
  // Results
  results: {
    summary: {
      mean: number;
      median: number;
      standardDeviation: number;
      skewness: number;
      kurtosis: number;
      min: number;
      max: number;
    };
    percentiles: {
      p1: number;
      p5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
      p99: number;
    };
    distribution: {
      [range: string]: number;
    };
    convergence: {
      iterations: number[];
      mean: number[];
      standardDeviation: number[];
    };
  };
  
  // Risk metrics
  riskMetrics: {
    var95: number; // Value at Risk 95%
    var99: number; // Value at Risk 99%
    cvar95: number; // Conditional Value at Risk 95%
    cvar99: number; // Conditional Value at Risk 99%
    probabilityOfLoss: number;
    expectedShortfall: number;
  };
  
  createdAt: number;
  modifiedAt: number;
}

// Enhanced budget model
export interface BudgetModel {
  id: string;
  name: string;
  description: string;
  
  // Flexible period structure
  periods: {
    [periodId: string]: {
      name: string;
      year: number;
      quarter?: number;
      month?: number;
      isHistorical: boolean;
      isBudget: boolean;
      isForecast: boolean;
    };
  };
  
  // Dynamic budget structure
  budgets: {
    [periodId: string]: {
      [categoryId: string]: {
        name: string;
        value: number;
        formula: string | null;
        category: 'revenue' | 'expense' | 'capital' | 'financing' | 'other';
        subcategory?: string;
        isCalculated: boolean;
        assumptions: string[];
        notes?: string;
        variance?: {
          actual?: number;
          variance?: number;
          variancePercent?: number;
        };
      };
    };
  };
  
  // Variance analysis
  varianceAnalysis: {
    [periodId: string]: {
      [categoryId: string]: {
        budget: number;
        actual: number;
        variance: number;
        variancePercent: number;
        explanation?: string;
        actions?: string[];
      };
    };
  };
  
  // Rolling forecasts
  rollingForecasts: {
    [forecastId: string]: {
      name: string;
      description: string;
      periods: string[];
      assumptions: { [key: string]: number };
      results: { [periodId: string]: { [categoryId: string]: number } };
    };
  };
  
  createdAt: number;
  modifiedAt: number;
}

// Investment analysis
export interface InvestmentAnalysis {
  id: string;
  name: string;
  description: string;
  
  // Investment details
  investment: {
    amount: number;
    currency: string;
    date: string;
    type: 'equity' | 'debt' | 'hybrid' | 'real_estate' | 'other';
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Cash flow projections
  cashFlows: {
    [periodId: string]: {
      period: string;
      cashFlow: number;
      probability?: number;
      notes?: string;
    };
  };
  
  // Analysis results
  analysis: {
    irr: number;
    npv: number;
    paybackPeriod: number;
    profitabilityIndex: number;
    roi: number;
    modifiedIrr?: number;
    discountedPaybackPeriod?: number;
  };
  
  // Risk analysis
  riskAnalysis: {
    sensitivity: {
      [variableId: string]: {
        variable: string;
        baseValue: number;
        irrImpact: number;
        npvImpact: number;
      };
    };
    scenarioAnalysis: {
      [scenarioId: string]: {
        name: string;
        probability: number;
        irr: number;
        npv: number;
        paybackPeriod: number;
      };
    };
    monteCarlo?: MonteCarloSimulation;
  };
  
  createdAt: number;
  modifiedAt: number;
}

// Financial formulas library
export interface FinancialFormula {
  id: string;
  name: string;
  description: string;
  category: 'valuation' | 'financial_metrics' | 'statistical' | 'custom';
  formula: string;
  parameters: {
    name: string;
    description: string;
    type: 'number' | 'string' | 'boolean' | 'date';
    required: boolean;
    default?: any;
    validation?: string;
  }[];
  examples: {
    description: string;
    inputs: { [key: string]: any };
    expectedOutput: any;
  }[];
  tags: string[];
  isBuiltIn: boolean;
  createdAt: number;
  modifiedAt: number;
}

// Model template
export interface FinancialModelTemplate {
  id: string;
  name: string;
  description: string;
  category: 'valuation' | 'budgeting' | 'investment' | 'risk' | 'general';
  industry?: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  template: Partial<FinancialModel>;
  tags: string[];
  author: string;
  version: string;
  rating?: number;
  downloads?: number;
  createdAt: number;
  modifiedAt: number;
}

// Validation and error handling
export interface ValidationError {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  cell?: string;
  sheet?: string;
  rule?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
}

// Model comparison
export interface ModelComparison {
  id: string;
  name: string;
  description: string;
  models: string[]; // Model IDs to compare
  comparisonMetrics: string[];
  results: {
    [metricId: string]: {
      [modelId: string]: number | string;
    };
  };
  createdAt: number;
  modifiedAt: number;
} 