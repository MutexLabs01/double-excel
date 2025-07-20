import { 
  FinancialModel, 
  DCFModel, 
  SensitivityAnalysis, 
  InvestmentAnalysis,
  MonteCarloSimulation,
  FinancialAssumption 
} from '../types/financial';

// DCF (Discounted Cash Flow) Calculations
export const calculateFreeCashFlow = (
  revenue: number,
  cogs: number,
  opex: number,
  depreciation: number,
  capex: number,
  workingCapitalChange: number
): number => {
  const ebit = revenue - cogs - opex;
  const ebitda = ebit + depreciation;
  const nopat = ebit * (1 - 0.25); // Assuming 25% tax rate
  const fcf = nopat + depreciation - capex - workingCapitalChange;
  return fcf;
};

export const calculateTerminalValue = (
  finalFCF: number,
  terminalGrowthRate: number,
  discountRate: number
): number => {
  return finalFCF * (1 + terminalGrowthRate) / (discountRate - terminalGrowthRate);
};

export const calculatePresentValue = (
  cashFlows: number[],
  discountRate: number
): number => {
  return cashFlows.reduce((pv, cf, year) => {
    return pv + cf / Math.pow(1 + discountRate, year + 1);
  }, 0);
};

export const calculateDCF = (model: DCFModel): DCFModel => {
  const years = Object.keys(model.freeCashFlows);
  const cashFlows = years.map(year => model.freeCashFlows[year].freeCashFlow);
  
  const terminalValue = calculateTerminalValue(
    cashFlows[cashFlows.length - 1],
    model.terminalGrowthRate,
    model.discountRate
  );
  
  const presentValue = calculatePresentValue(cashFlows, model.discountRate);
  const enterpriseValue = presentValue + terminalValue;
  const equityValue = enterpriseValue; // Simplified - no debt consideration
  
  return {
    ...model,
    terminalValue,
    presentValue,
    enterpriseValue,
    equityValue
  };
};

// Investment Analysis
export const calculateIRR = (cashFlows: number[]): number => {
  // Simplified IRR calculation using Newton-Raphson method
  let guess = 0.1;
  const tolerance = 0.0001;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(cashFlows, guess);
    const derivative = calculateNPVDerivative(cashFlows, guess);
    
    if (Math.abs(npv) < tolerance) {
      return guess;
    }
    
    guess = guess - npv / derivative;
  }
  
  return guess;
};

export const calculateNPV = (cashFlows: number[], discountRate: number): number => {
  return cashFlows.reduce((npv, cf, year) => {
    return npv + cf / Math.pow(1 + discountRate, year);
  }, 0);
};

const calculateNPVDerivative = (cashFlows: number[], discountRate: number): number => {
  return cashFlows.reduce((derivative, cf, year) => {
    if (year === 0) return derivative;
    return derivative - (year * cf) / Math.pow(1 + discountRate, year + 1);
  }, 0);
};

export const calculatePaybackPeriod = (cashFlows: number[]): number => {
  let cumulativeCF = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulativeCF += cashFlows[i];
    if (cumulativeCF >= 0) {
      return i + (Math.abs(cashFlows[i] - cumulativeCF) / Math.abs(cashFlows[i]));
    }
  }
  return cashFlows.length;
};

export const calculateProfitabilityIndex = (
  cashFlows: number[],
  discountRate: number
): number => {
  const npv = calculateNPV(cashFlows, discountRate);
  const initialInvestment = Math.abs(cashFlows[0]);
  return (npv + initialInvestment) / initialInvestment;
};

// Sensitivity Analysis
export const performSensitivityAnalysis = (
  baseModel: DCFModel,
  variables: string[],
  ranges: { [key: string]: { min: number; max: number; step: number } }
): SensitivityAnalysis => {
  const scenarios: any = {};
  const tornadoChart: { variable: string; impact: number }[] = [];
  
  variables.forEach(variable => {
    const range = ranges[variable];
    const baseValue = baseModel.assumptions.find(a => a.name === variable)?.value || 0;
    
    // Test min and max values
    const minModel = { ...baseModel };
    const maxModel = { ...baseModel };
    
    // Update assumption values
    const minAssumption = minModel.assumptions.find(a => a.name === variable);
    const maxAssumption = maxModel.assumptions.find(a => a.name === variable);
    
    if (minAssumption) minAssumption.value = range.min;
    if (maxAssumption) maxAssumption.value = range.max;
    
    const minDCF = calculateDCF(minModel);
    const maxDCF = calculateDCF(maxModel);
    
    scenarios[`${variable}_min`] = {
      assumptions: { [variable]: range.min },
      results: {
        enterpriseValue: minDCF.enterpriseValue,
        equityValue: minDCF.equityValue,
        irr: 0, // Would need to calculate based on cash flows
        npv: minDCF.presentValue
      }
    };
    
    scenarios[`${variable}_max`] = {
      assumptions: { [variable]: range.max },
      results: {
        enterpriseValue: maxDCF.enterpriseValue,
        equityValue: maxDCF.equityValue,
        irr: 0,
        npv: maxDCF.presentValue
      }
    };
    
    const impact = Math.abs(maxDCF.enterpriseValue - minDCF.enterpriseValue);
    tornadoChart.push({ variable, impact });
  });
  
  tornadoChart.sort((a, b) => b.impact - a.impact);
  
  return {
    id: generateId(),
    name: 'Sensitivity Analysis',
    baseCase: baseModel,
    scenarios,
    tornadoChart
  };
};

// Monte Carlo Simulation
export const runMonteCarloSimulation = (
  model: DCFModel,
  iterations: number,
  variableDistributions: {
    [key: string]: {
      distribution: 'normal' | 'uniform' | 'triangular' | 'lognormal';
      mean: number;
      standardDeviation: number;
      min: number;
      max: number;
    };
  }
): MonteCarloSimulation => {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const simulationModel = { ...model };
    
    // Generate random values for each variable
    Object.keys(variableDistributions).forEach(variable => {
      const dist = variableDistributions[variable];
      const assumption = simulationModel.assumptions.find(a => a.name === variable);
      
      if (assumption) {
        assumption.value = generateRandomValue(dist);
      }
    });
    
    const dcfResult = calculateDCF(simulationModel);
    results.push(dcfResult.enterpriseValue);
  }
  
  const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
  const sortedResults = results.sort((a, b) => a - b);
  const median = sortedResults[Math.floor(results.length / 2)];
  
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    id: generateId(),
    name: 'Monte Carlo Simulation',
    iterations,
    variables: variableDistributions,
    results: {
      mean,
      median,
      standardDeviation,
      percentiles: {
        p10: sortedResults[Math.floor(results.length * 0.1)],
        p25: sortedResults[Math.floor(results.length * 0.25)],
        p75: sortedResults[Math.floor(results.length * 0.75)],
        p90: sortedResults[Math.floor(results.length * 0.9)]
      },
      distribution: {} // Would calculate histogram bins
    }
  };
};

const generateRandomValue = (distribution: any): number => {
  switch (distribution.distribution) {
    case 'normal':
      return generateNormalRandom(distribution.mean || 0, distribution.standardDeviation || 1);
    case 'uniform':
      return generateUniformRandom(distribution.min || 0, distribution.max || 1);
    case 'triangular':
      return generateTriangularRandom(distribution.min || 0, distribution.max || 1, distribution.mean || 0.5);
    case 'lognormal':
      return generateLognormalRandom(distribution.mean || 0, distribution.standardDeviation || 1);
    default:
      return 0;
  }
};

const generateNormalRandom = (mean: number, stdDev: number): number => {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
};

const generateUniformRandom = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

const generateTriangularRandom = (min: number, max: number, mode: number): number => {
  const u = Math.random();
  const c = (mode - min) / (max - min);
  
  if (u < c) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
};

const generateLognormalRandom = (mean: number, stdDev: number): number => {
  const normal = generateNormalRandom(mean, stdDev);
  return Math.exp(normal);
};

// Financial Ratios and Metrics
export const calculateFinancialRatios = (financialData: any) => {
  return {
    // Profitability Ratios
    grossMargin: (financialData.revenue - financialData.cogs) / financialData.revenue,
    operatingMargin: (financialData.revenue - financialData.cogs - financialData.opex) / financialData.revenue,
    netMargin: financialData.netIncome / financialData.revenue,
    
    // Efficiency Ratios
    assetTurnover: financialData.revenue / financialData.totalAssets,
    inventoryTurnover: financialData.cogs / financialData.inventory,
    
    // Liquidity Ratios
    currentRatio: financialData.currentAssets / financialData.currentLiabilities,
    quickRatio: (financialData.currentAssets - financialData.inventory) / financialData.currentLiabilities,
    
    // Solvency Ratios
    debtToEquity: financialData.totalDebt / financialData.totalEquity,
    debtToAssets: financialData.totalDebt / financialData.totalAssets,
    
    // Valuation Ratios
    peRatio: financialData.marketCap / financialData.netIncome,
    evEbitda: financialData.enterpriseValue / financialData.ebitda,
    pbRatio: financialData.marketCap / financialData.bookValue
  };
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Template Functions
export const createDCFTemplate = (): DCFModel => {
  return {
    id: generateId(),
    name: 'DCF Model Template',
    projectionYears: 5,
    terminalGrowthRate: 0.03,
    discountRate: 0.10,
    freeCashFlows: {
      '2024': {
        revenue: 1000000,
        cogs: 600000,
        opex: 200000,
        depreciation: 50000,
        capex: 80000,
        workingCapital: 10000,
        freeCashFlow: 0
      },
      '2025': {
        revenue: 1100000,
        cogs: 660000,
        opex: 220000,
        depreciation: 55000,
        capex: 88000,
        workingCapital: 11000,
        freeCashFlow: 0
      }
    },
    terminalValue: 0,
    presentValue: 0,
    enterpriseValue: 0,
    equityValue: 0,
    assumptions: [
      {
        id: generateId(),
        name: 'Revenue Growth Rate',
        value: 0.10,
        unit: '%',
        description: 'Annual revenue growth rate',
        category: 'growth',
        isVariable: true,
        minValue: 0.05,
        maxValue: 0.20,
        step: 0.01
      },
      {
        id: generateId(),
        name: 'Gross Margin',
        value: 0.40,
        unit: '%',
        description: 'Gross profit margin',
        category: 'margin',
        isVariable: true,
        minValue: 0.30,
        maxValue: 0.50,
        step: 0.01
      }
    ]
  };
};

export const createBudgetTemplate = () => {
  return {
    id: generateId(),
    name: 'Budget Model Template',
    period: 'monthly' as const,
    budgetYear: 2024,
    revenueBudget: {
      'Jan': { 'Product A': 100000, 'Product B': 50000 },
      'Feb': { 'Product A': 110000, 'Product B': 55000 }
    },
    expenseBudget: {
      'Jan': { 'Salaries': 80000, 'Marketing': 20000, 'Rent': 15000 },
      'Feb': { 'Salaries': 80000, 'Marketing': 22000, 'Rent': 15000 }
    },
    capitalBudget: {
      'Jan': { 'Equipment': 50000, 'Software': 10000 },
      'Feb': { 'Equipment': 0, 'Software': 5000 }
    },
    varianceAnalysis: {
      'Jan': { revenueVariance: 0, expenseVariance: 0, netVariance: 0 },
      'Feb': { revenueVariance: 0, expenseVariance: 0, netVariance: 0 }
    }
  };
}; 