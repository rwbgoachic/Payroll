// Payroll processor module

const moment = require('moment');
import { validateEmployee } from './employeeValidator';
import { calculateTax } from './taxCalculator';
import { generatePayStub } from './payStubGenerator';

/**
 * Process payroll for a given employee
 * @param {Object} employee - Employee data
 * @param {Object} payPeriod - Pay period information
 * @returns {Object} - Processed payroll data
 */
function processPayroll(employee, payPeriod) {
  // Validate employee data
  validateEmployee(employee);
  
  // Calculate gross pay
  const grossPay = calculateGrossPay(employee, payPeriod);
  
  // Calculate taxes
  const taxes = calculateTax(grossPay, employee.filingStatus);
  
  // Calculate deductions
  const deductions = calculateDeductions(employee, grossPay);
  
  // Calculate net pay
  const netPay = grossPay - taxes - deductions;
  
  // Generate pay stub
  const payStub = generatePayStub(employee, payPeriod, grossPay, taxes, deductions, netPay);
  
  return {
    employeeId: employee.id,
    payPeriodId: payPeriod.id,
    grossPay,
    taxes,
    deductions,
    netPay,
    payStub
  };
}

/**
 * Calculate gross pay for an employee
 * @param {Object} employee - Employee data
 * @param {Object} payPeriod - Pay period information
 * @returns {number} - Gross pay amount
 */
function calculateGrossPay(employee, payPeriod) {
  if (employee.payType === 'salary') {
    // Calculate salary for the pay period
    return calculateSalaryPay(employee, payPeriod);
  } else {
    // Calculate hourly pay
    return calculateHourlyPay(employee, payPeriod);
  }
}

/**
 * Calculate salary pay for the period
 * @param {Object} employee - Employee data
 * @param {Object} payPeriod - Pay period information
 * @returns {number} - Salary amount for the period
 */
function calculateSalaryPay(employee, payPeriod) {
  const annualSalary = employee.salary;
  
  // Determine pay frequency divisor
  let divisor;
  switch (payPeriod.frequency) {
    case 'weekly':
      divisor = 52;
      break;
    case 'bi-weekly':
      divisor = 26;
      break;
    case 'semi-monthly':
      divisor = 24;
      break;
    case 'monthly':
      divisor = 12;
      break;
    default:
      divisor = 26; // Default to bi-weekly
  }
  
  return Math.round((annualSalary / divisor) * 100) / 100;
}

/**
 * Calculate hourly pay for the period
 * @param {Object} employee - Employee data
 * @param {Object} payPeriod - Pay period information
 * @returns {number} - Hourly pay amount for the period
 */
function calculateHourlyPay(employee, payPeriod) {
  const hourlyRate = employee.hourlyRate;
  const regularHours = employee.hours.regular || 0;
  const overtimeHours = employee.hours.overtime || 0;
  
  const regularPay = hourlyRate * regularHours;
  const overtimePay = hourlyRate * 1.5 * overtimeHours;
  
  return Math.round((regularPay + overtimePay) * 100) / 100;
}

/**
 * Calculate deductions for an employee
 * @param {Object} employee - Employee data
 * @param {number} grossPay - Gross pay amount
 * @returns {number} - Total deductions
 */
function calculateDeductions(employee, grossPay) {
  let totalDeductions = 0;
  
  // Process each deduction
  if (employee.deductions && Array.isArray(employee.deductions)) {
    employee.deductions.forEach(deduction => {
      if (deduction.type === 'fixed') {
        totalDeductions += deduction.amount;
      } else if (deduction.type === 'percentage') {
        totalDeductions += grossPay * (deduction.percentage / 100);
      }
    });
  }
  
  return Math.round(totalDeductions * 100) / 100;
}

// Export functions
module.exports = {
  processPayroll,
  calculateGrossPay,
  calculateSalaryPay,
  calculateHourlyPay,
  calculateDeductions
};