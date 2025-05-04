import { supabase } from '../lib/supabase';
import { CircuitBreaker, retry } from '../lib/resilience';
import { WalletService } from '../services/walletService';

interface DisbursementResult {
  success: boolean;
  method: 'wallet' | 'ach';
  transactionId?: string;
  error?: string;
}

interface EmployerWallet {
  id: string;
  company_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

interface EmployeeWallet {
  id: string;
  employee_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

// Create circuit breakers for critical operations
const walletCircuitBreaker = new CircuitBreaker(3, 60000, 30000);
const achCircuitBreaker = new CircuitBreaker(3, 120000, 60000);

/**
 * Process payroll disbursement for an employee
 * @param employerId The employer's ID
 * @param employeeId The employee's ID
 * @param netPay The net pay amount to disburse
 * @returns A promise that resolves to a DisbursementResult
 */
export async function processDisbursement(
  employerId: string,
  employeeId: string,
  netPay: number
): Promise<DisbursementResult> {
  try {
    // Get employer wallet with circuit breaker protection
    const employerWallet = await walletCircuitBreaker.execute(async () => {
      const { data, error } = await supabase
        .from('employer_wallets')
        .select('*')
        .eq('company_id', employerId)
        .single();

      if (error) {
        throw new Error(`Failed to get employer wallet: ${error.message}`);
      }
      
      return data;
    });

    // Check if employer wallet has sufficient balance
    if (employerWallet.balance >= netPay) {
      // Transfer from employer wallet to employee wallet
      const result = await WalletService.processPayrollDisbursement(employerId, employeeId, netPay);
      
      if (!result.success) {
        throw new Error(result.error || 'Wallet transfer failed');
      }
      
      return {
        success: true,
        method: 'wallet',
        transactionId: result.transactionId
      };
    } else {
      // Initiate ACH transfer via Helcim API
      const result = await initiateAchTransfer(employerId, employeeId, netPay);
      return {
        success: true,
        method: 'ach',
        transactionId: result.transactionId
      };
    }
  } catch (error) {
    console.error('Disbursement error:', error);
    return {
      success: false,
      method: 'wallet', // Default method
      error: error instanceof Error ? error.message : 'Unknown error during disbursement'
    };
  }
}

/**
 * Initiate an ACH transfer via the Helcim API
 * @param employerId The employer's ID
 * @param employeeId The employee's ID
 * @param amount The amount to transfer
 * @returns A promise that resolves to the transaction details
 */
async function initiateAchTransfer(
  employerId: string,
  employeeId: string,
  amount: number
): Promise<{ transactionId: string }> {
  try {
    // Use circuit breaker to protect against API failures
    return await achCircuitBreaker.execute(async () => {
      // Get Helcim integration details
      const { data: helcimIntegration, error: helcimError } = await supabase
        .from('helcim_integration')
        .select('*')
        .eq('company_id', employerId)
        .single();

      if (helcimError) {
        throw new Error(`Failed to get Helcim integration: ${helcimError.message}`);
      }

      // Get employee payment method
      const { data: paymentMethod, error: paymentMethodError } = await supabase
        .from('helcim_payment_methods')
        .select(`
          *,
          customer:helcim_customers(*)
        `)
        .eq('customer.employee_id', employeeId)
        .eq('is_default', true)
        .single();

      if (paymentMethodError) {
        throw new Error(`Failed to get employee payment method: ${paymentMethodError.message}`);
      }

      // In a real implementation, we would call the Helcim API here
      // For now, we'll simulate a successful API call
      
      // Record the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('helcim_transactions')
        .insert({
          transaction_id: `ACH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customer_id: paymentMethod.customer.id,
          payment_method_id: paymentMethod.id,
          amount: amount,
          currency: 'USD',
          status: 'approved',
          auth_code: `AUTH-${Math.floor(Math.random() * 1000000)}`,
          message: 'ACH transfer initiated',
          metadata: {
            payroll_transfer: true,
            employer_id: employerId,
            employee_id: employeeId
          }
        })
        .select()
        .single();

      if (transactionError) {
        throw new Error(`Failed to record transaction: ${transactionError.message}`);
      }

      return { transactionId: transaction.transaction_id };
    });
  } catch (error) {
    console.error('ACH transfer error:', error);
    throw error;
  }
}

/**
 * Get the disbursement status for a transaction
 * @param transactionId The transaction ID
 * @returns A promise that resolves to the transaction status
 */
export async function getDisbursementStatus(transactionId: string): Promise<{
  status: 'pending' | 'completed' | 'failed';
  details?: any;
}> {
  try {
    // Use retry with exponential backoff for status checks
    return await retry(async () => {
      const { data: transaction, error } = await supabase
        .from('helcim_transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (error) {
        throw new Error(`Failed to get transaction: ${error.message}`);
      }

      // Map Helcim status to our status
      let status: 'pending' | 'completed' | 'failed';
      switch (transaction.status) {
        case 'approved':
          status = 'completed';
          break;
        case 'pending':
          status = 'pending';
          break;
        case 'declined':
        case 'error':
          status = 'failed';
          break;
        default:
          status = 'pending';
      }

      return {
        status,
        details: transaction
      };
    }, 3, 2000);
  } catch (error) {
    console.error('Error getting disbursement status:', error);
    return {
      status: 'failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}