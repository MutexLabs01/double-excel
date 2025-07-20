import { SpreadsheetData } from '../types/project';
import { parseRange } from './helpers';

export const evaluateFormula = (formula: string, data: SpreadsheetData): number | string => {
  if (!formula.startsWith('=')) {
    return formula;
  }

  const expression = formula.slice(1).toUpperCase();
  
  // Handle basic arithmetic operations
  if (expression.includes('+') || expression.includes('-') || expression.includes('*') || expression.includes('/')) {
    return evaluateArithmetic(expression, data);
  }

  // Handle function calls
  if (expression.includes('(')) {
    return evaluateFunction(expression, data);
  }

  // Handle single cell reference
  if (expression.match(/^[A-Z]+\d+$/)) {
    return getCellValue(expression, data);
  }

  throw new Error('Invalid formula');
};

const evaluateArithmetic = (expression: string, data: SpreadsheetData): number => {
  // Replace cell references with their values
  const processedExpression = expression.replace(/[A-Z]+\d+/g, (match) => {
    const value = getCellValue(match, data);
    return typeof value === 'number' ? value.toString() : '0';
  });

  try {
    // Simple arithmetic evaluation (in a real app, use a proper expression parser)
    return Function(`"use strict"; return (${processedExpression})`)();
  } catch (error) {
    throw new Error('Invalid arithmetic expression');
  }
};

const evaluateFunction = (expression: string, data: SpreadsheetData): number => {
  const match = expression.match(/^([A-Z]+)\((.*)\)$/);
  if (!match) throw new Error('Invalid function syntax');

  const [, funcName, args] = match;
  
  switch (funcName) {
    case 'SUM':
      return calculateSum(args, data);
    case 'AVERAGE':
      return calculateAverage(args, data);
    case 'COUNT':
      return calculateCount(args, data);
    case 'MIN':
      return calculateMin(args, data);
    case 'MAX':
      return calculateMax(args, data);
    case 'IF':
      return calculateIf(args, data);
    default:
      throw new Error(`Unknown function: ${funcName}`);
  }
};

const getCellValue = (cellRef: string, data: SpreadsheetData): number => {
  const match = cellRef.match(/([A-Z]+)(\d+)/);
  if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);
  
  const [, col, row] = match;
  const colIndex = col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
  const rowIndex = parseInt(row) - 1;
  
  const cell = data[`${rowIndex}-${colIndex}`];
  if (!cell) return 0;
  
  if (cell.formula) {
    try {
      const result = evaluateFormula(cell.formula, data);
      return typeof result === 'number' ? result : parseFloat(result.toString()) || 0;
    } catch (error) {
      return 0;
    }
  }
  
  return parseFloat(cell.value) || 0;
};

const getRangeValues = (range: string, data: SpreadsheetData): number[] => {
  const { start, end } = parseRange(range);
  const values: number[] = [];
  
  for (let row = start[0]; row <= end[0]; row++) {
    for (let col = start[1]; col <= end[1]; col++) {
      const cell = data[`${row}-${col}`];
      if (cell) {
        if (cell.formula) {
          try {
            const result = evaluateFormula(cell.formula, data);
            const numValue = typeof result === 'number' ? result : parseFloat(result.toString());
            if (!isNaN(numValue)) values.push(numValue);
          } catch (error) {
            // Skip invalid formulas
          }
        } else {
          const numValue = parseFloat(cell.value);
          if (!isNaN(numValue)) values.push(numValue);
        }
      }
    }
  }
  
  return values;
};

const calculateSum = (args: string, data: SpreadsheetData): number => {
  const values = getRangeValues(args.trim(), data);
  return values.reduce((sum, value) => sum + value, 0);
};

const calculateAverage = (args: string, data: SpreadsheetData): number => {
  const values = getRangeValues(args.trim(), data);
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
};

const calculateCount = (args: string, data: SpreadsheetData): number => {
  const values = getRangeValues(args.trim(), data);
  return values.length;
};

const calculateMin = (args: string, data: SpreadsheetData): number => {
  const values = getRangeValues(args.trim(), data);
  return values.length > 0 ? Math.min(...values) : 0;
};

const calculateMax = (args: string, data: SpreadsheetData): number => {
  const values = getRangeValues(args.trim(), data);
  return values.length > 0 ? Math.max(...values) : 0;
};

const calculateIf = (args: string, data: SpreadsheetData): number => {
  const parts = args.split(',').map(s => s.trim());
  if (parts.length !== 3) throw new Error('IF function requires 3 arguments');
  
  const [condition, trueValue, falseValue] = parts;
  
  // Simple condition evaluation (A1>10, A1="text", etc.)
  const conditionResult = evaluateCondition(condition, data);
  
  if (conditionResult) {
    return parseFloat(trueValue) || 0;
  } else {
    return parseFloat(falseValue) || 0;
  }
};

const evaluateCondition = (condition: string, data: SpreadsheetData): boolean => {
  // Simple condition parser (in a real app, use a proper parser)
  const operators = ['>=', '<=', '>', '<', '=', '!='];
  const operator = operators.find(op => condition.includes(op));
  
  if (!operator) return false;
  
  const [left, right] = condition.split(operator);
  const leftValue = getCellValue(left.trim(), data);
  const rightValue = parseFloat(right.trim()) || 0;
  
  switch (operator) {
    case '>=': return leftValue >= rightValue;
    case '<=': return leftValue <= rightValue;
    case '>': return leftValue > rightValue;
    case '<': return leftValue < rightValue;
    case '=': return leftValue === rightValue;
    case '!=': return leftValue !== rightValue;
    default: return false;
  }
};