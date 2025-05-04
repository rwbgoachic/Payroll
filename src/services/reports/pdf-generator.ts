import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '../../lib/core';

// Add type definition for jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Generate a PDF payroll report
 * @param payrollData Payroll data to include in the report
 * @returns PDF document as Blob
 */
export async function generatePayrollPDF(payrollData: {
  companyName: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  totalGrossPay: number;
  totalTaxes: number;
  totalDeductions: number;
  totalNetPay: number;
  employees: Array<{
    name: string;
    department: string;
    grossPay: number;
    taxes: number;
    deductions: number;
    netPay: number;
  }>;
}): Promise<Blob> {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.text(payrollData.companyName, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Payroll Report', 105, 30, { align: 'center' });
  
  // Add period information
  doc.setFontSize(10);
  doc.text(`Pay Period: ${formatDate(payrollData.periodStart)} to ${formatDate(payrollData.periodEnd)}`, 105, 40, { align: 'center' });
  doc.text(`Pay Date: ${formatDate(payrollData.payDate)}`, 105, 45, { align: 'center' });
  
  // Add summary table
  doc.setFontSize(12);
  doc.text('Payroll Summary', 14, 55);
  
  doc.autoTable({
    startY: 60,
    head: [['Description', 'Amount']],
    body: [
      ['Total Gross Pay', formatCurrency(payrollData.totalGrossPay)],
      ['Total Taxes', formatCurrency(payrollData.totalTaxes)],
      ['Total Deductions', formatCurrency(payrollData.totalDeductions)],
      ['Total Net Pay', formatCurrency(payrollData.totalNetPay)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    foot: [['Total Net Pay', formatCurrency(payrollData.totalNetPay)]],
    footStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add employee details table
  doc.setFontSize(12);
  doc.text('Employee Details', 14, doc.autoTable.previous.finalY + 10);
  
  const employeeTableData = payrollData.employees.map(employee => [
    employee.name,
    employee.department,
    formatCurrency(employee.grossPay),
    formatCurrency(employee.taxes),
    formatCurrency(employee.deductions),
    formatCurrency(employee.netPay)
  ]);
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Employee', 'Department', 'Gross Pay', 'Taxes', 'Deductions', 'Net Pay']],
    body: employeeTableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Return as blob
  return doc.output('blob');
}

/**
 * Generate a PDF pay stub
 * @param payStubData Pay stub data
 * @returns PDF document as Blob
 */
export async function generatePayStubPDF(payStubData: {
  companyName: string;
  companyAddress: string;
  employeeName: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  earnings: Array<{
    description: string;
    hours?: number;
    rate?: number;
    amount: number;
  }>;
  taxes: Array<{
    description: string;
    amount: number;
  }>;
  deductions: Array<{
    description: string;
    amount: number;
  }>;
  grossPay: number;
  netPay: number;
  ytdGrossPay: number;
  ytdNetPay: number;
}): Promise<Blob> {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(16);
  doc.text(payStubData.companyName, 14, 20);
  
  doc.setFontSize(10);
  doc.text(payStubData.companyAddress, 14, 25);
  
  // Add pay stub title
  doc.setFontSize(14);
  doc.text('PAY STUB', 105, 35, { align: 'center' });
  
  // Add employee information
  doc.setFontSize(10);
  doc.text(`Employee: ${payStubData.employeeName}`, 14, 45);
  doc.text(`Employee ID: ${payStubData.employeeId}`, 14, 50);
  doc.text(`Pay Period: ${formatDate(payStubData.periodStart)} to ${formatDate(payStubData.periodEnd)}`, 14, 55);
  doc.text(`Pay Date: ${formatDate(payStubData.payDate)}`, 14, 60);
  
  // Add earnings table
  doc.setFontSize(12);
  doc.text('Earnings', 14, 70);
  
  const earningsTableData = payStubData.earnings.map(earning => [
    earning.description,
    earning.hours !== undefined ? earning.hours.toFixed(2) : '',
    earning.rate !== undefined ? formatCurrency(earning.rate) : '',
    formatCurrency(earning.amount)
  ]);
  
  doc.autoTable({
    startY: 75,
    head: [['Description', 'Hours', 'Rate', 'Amount']],
    body: earningsTableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    foot: [['Total Earnings', '', '', formatCurrency(payStubData.grossPay)]],
    footStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add taxes table
  doc.setFontSize(12);
  doc.text('Taxes', 14, doc.autoTable.previous.finalY + 10);
  
  const taxesTableData = payStubData.taxes.map(tax => [
    tax.description,
    formatCurrency(tax.amount)
  ]);
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Description', 'Amount']],
    body: taxesTableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    foot: [['Total Taxes', formatCurrency(payStubData.taxes.reduce((sum, tax) => sum + tax.amount, 0))]],
    footStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add deductions table
  doc.setFontSize(12);
  doc.text('Deductions', 14, doc.autoTable.previous.finalY + 10);
  
  const deductionsTableData = payStubData.deductions.map(deduction => [
    deduction.description,
    formatCurrency(deduction.amount)
  ]);
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Description', 'Amount']],
    body: deductionsTableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    foot: [['Total Deductions', formatCurrency(payStubData.deductions.reduce((sum, deduction) => sum + deduction.amount, 0))]],
    footStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add summary table
  doc.setFontSize(12);
  doc.text('Summary', 14, doc.autoTable.previous.finalY + 10);
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Description', 'Current', 'Year-to-Date']],
    body: [
      ['Gross Pay', formatCurrency(payStubData.grossPay), formatCurrency(payStubData.ytdGrossPay)],
      ['Net Pay', formatCurrency(payStubData.netPay), formatCurrency(payStubData.ytdNetPay)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Return as blob
  return doc.output('blob');
}

/**
 * Generate a PDF tax report
 * @param taxData Tax report data
 * @returns PDF document as Blob
 */
export async function generateTaxReportPDF(taxData: {
  companyName: string;
  year: number;
  quarter?: number;
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateTaxes: Record<string, number>;
  totalTaxLiability: number;
  monthlyBreakdown: Record<string, {
    federalIncomeTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    stateTaxes: Record<string, number>;
    totalTaxLiability: number;
  }>;
}): Promise<Blob> {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(16);
  doc.text(taxData.companyName, 14, 20);
  
  // Add report title
  doc.setFontSize(14);
  if (taxData.quarter) {
    doc.text(`Q${taxData.quarter} ${taxData.year} Tax Liability Report`, 105, 35, { align: 'center' });
  } else {
    doc.text(`${taxData.year} Annual Tax Liability Report`, 105, 35, { align: 'center' });
  }
  
  // Add summary table
  doc.setFontSize(12);
  doc.text('Tax Liability Summary', 14, 45);
  
  const summaryTableData = [
    ['Federal Income Tax', formatCurrency(taxData.federalIncomeTax)],
    ['Social Security Tax', formatCurrency(taxData.socialSecurityTax)],
    ['Medicare Tax', formatCurrency(taxData.medicareTax)]
  ];
  
  // Add state taxes
  Object.entries(taxData.stateTaxes).forEach(([state, amount]) => {
    summaryTableData.push([`${state} State Income Tax`, formatCurrency(amount)]);
  });
  
  doc.autoTable({
    startY: 50,
    head: [['Description', 'Amount']],
    body: summaryTableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    foot: [['Total Tax Liability', formatCurrency(taxData.totalTaxLiability)]],
    footStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add monthly breakdown
  doc.setFontSize(12);
  doc.text('Monthly Breakdown', 14, doc.autoTable.previous.finalY + 10);
  
  const monthlyTableData: any[][] = [];
  
  Object.entries(taxData.monthlyBreakdown).forEach(([month, data]) => {
    monthlyTableData.push([
      formatYearMonth(month),
      formatCurrency(data.federalIncomeTax),
      formatCurrency(data.socialSecurityTax),
      formatCurrency(data.medicareTax),
      formatCurrency(data.totalTaxLiability)
    ]);
  });
  
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Month', 'Federal', 'Social Security', 'Medicare', 'Total']],
    body: monthlyTableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Return as blob
  return doc.output('blob');
}

/**
 * Format date string to MM/DD/YYYY
 * @param dateString Date string
 * @returns Formatted date string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format year-month string (YYYY-MM) to Month YYYY
 * @param yearMonth Year-month string (YYYY-MM)
 * @returns Formatted month and year
 */
function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}