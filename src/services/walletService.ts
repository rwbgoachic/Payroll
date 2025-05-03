import { supabase } from '../lib/supabase';
import { CircuitBreaker, retry } from '../lib/resilience';

// Circuit breaker for wallet operations
const walletCircuitBreaker = new CircuitBreaker(3, 60000, 30000);

interface WalletBalance {
  id: string;
  balance: number;
  currency: string;
}

interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class WalletService {
  /**
   * Get employer wallet for a company
   * @param companyId Company ID
   * @returns Employer wallet or null if not found
   */
  static async getEmployerWallet(companyId: string): Promise<WalletBalance | null> {
    try {
      return await walletCircuitBreaker.execute(async () => {
        const { data, error } = await supabase
          .from('employer_wallets')
          .select('*')
          .eq('company_id', companyId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Not found error
            return null;
          }
          throw error;
        }

        return data;
      });
    } catch (error) {
      console.error('Error getting employer wallet:', error);
      throw error;
    }
  }

  /**
   * Get employee wallet
   * @param employeeId Employee ID
   * @returns Employee wallet or null if not found
   */
  static async getEmployeeWallet(employeeId: string): Promise<WalletBalance | null> {
    try {
      return await walletCircuitBreaker.execute(async () => {
        const { data, error } = await supabase
          .from('employee_wallets')
          .select('*')
          .eq('employee_id', employeeId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Not found error
            return null;
          }
          throw error;
        }

        return data;
      });
    } catch (error) {
      console.error('Error getting employee wallet:', error);
      throw error;
    }
  }

  /**
   * Create or update employer wallet
   * @param companyId Company ID
   * @param initialBalance Initial balance (default: 0)
   * @param currency Currency code (default: USD)
   * @returns Created or updated wallet
   */
  static async createEmployerWallet(
    companyId: string,
    initialBalance: number = 0,
    currency: string = 'USD'
  ): Promise<WalletBalance> {
    try {
      // Check if wallet already exists
      const existingWallet = await this.getEmployerWallet(companyId);
      
      if (existingWallet) {
        return existingWallet;
      }
      
      // Create new wallet
      const { data, error } = await supabase
        .from('employer_wallets')
        .insert({
          company_id: companyId,
          balance: initialBalance,
          currency
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating employer wallet:', error);
      throw error;
    }
  }

  /**
   * Create or update employee wallet
   * @param employeeId Employee ID
   * @param initialBalance Initial balance (default: 0)
   * @param currency Currency code (default: USD)
   * @returns Created or updated wallet
   */
  static async createEmployeeWallet(
    employeeId: string,
    initialBalance: number = 0,
    currency: string = 'USD'
  ): Promise<WalletBalance> {
    try {
      // Check if wallet already exists
      const existingWallet = await this.getEmployeeWallet(employeeId);
      
      if (existingWallet) {
        return existingWallet;
      }
      
      // Create new wallet
      const { data, error } = await supabase
        .from('employee_wallets')
        .insert({
          employee_id: employeeId,
          balance: initialBalance,
          currency
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating employee wallet:', error);
      throw error;
    }
  }

  /**
   * Deposit funds to employer wallet
   * @param walletId Employer wallet ID
   * @param amount Amount to deposit
   * @param description Transaction description
   * @returns Transaction result
   */
  static async depositToEmployerWallet(
    walletId: string,
    amount: number,
    description: string = 'Deposit'
  ): Promise<TransactionResult> {
    try {
      return await walletCircuitBreaker.execute(async () => {
        // Get current wallet
        const { data: wallet, error: walletError } = await supabase
          .from('employer_wallets')
          .select('*')
          .eq('id', walletId)
          .single();

        if (walletError) throw walletError;

        // Update wallet balance
        const { error: updateError } = await supabase
          .from('employer_wallets')
          .update({
            balance: wallet.balance + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', walletId);

        if (updateError) throw updateError;

        // Record transaction
        const transactionId = crypto.randomUUID();
        
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            from_wallet_id: null,
            to_wallet_id: walletId,
            amount,
            currency: wallet.currency,
            transaction_type: 'deposit',
            status: 'completed',
            reference_id: `DEP-${Date.now()}`,
            description
          });

        if (transactionError) throw transactionError;

        return {
          success: true,
          transactionId: `DEP-${transactionId}`
        };
      });
    } catch (error) {
      console.error('Error depositing to employer wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Transfer funds from employer wallet to employee wallet
   * @param employerWalletId Employer wallet ID
   * @param employeeId Employee ID
   * @param amount Amount to transfer
   * @param description Transaction description
   * @returns Transaction result
   */
  static async transferToEmployee(
    employerWalletId: string,
    employeeId: string,
    amount: number,
    description: string = 'Transfer to employee'
  ): Promise<TransactionResult> {
    try {
      return await retry(async () => {
        // Use the database function for atomic transfer
        const { data, error } = await supabase.rpc('transfer_funds', {
          p_from_wallet_id: employerWalletId,
          p_employee_id: employeeId,
          p_amount: amount
        });

        if (error) throw error;

        return {
          success: true,
          transactionId: `WALLET-${data.transaction_id}`
        };
      }, 3, 1000);
    } catch (error) {
      console.error('Error transferring to employee:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transaction history for a wallet
   * @param walletId Wallet ID
   * @param walletType Type of wallet ('employer' or 'employee')
   * @param limit Number of transactions to return
   * @param offset Offset for pagination
   * @returns Array of transactions
   */
  static async getTransactionHistory(
    walletId: string,
    walletType: 'employer' | 'employee',
    limit: number = 10,
    offset: number = 0
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (walletType === 'employer') {
        query = query.eq('from_wallet_id', walletId);
      } else {
        query = query.eq('to_wallet_id', walletId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance for an employee
   * @param employeeId Employee ID
   * @returns Wallet balance or 0 if wallet doesn't exist
   */
  static async getEmployeeBalance(employeeId: string): Promise<number> {
    try {
      const wallet = await this.getEmployeeWallet(employeeId);
      return wallet ? wallet.balance : 0;
    } catch (error) {
      console.error('Error getting employee balance:', error);
      return 0;
    }
  }

  /**
   * Get wallet balance for a company
   * @param companyId Company ID
   * @returns Wallet balance or 0 if wallet doesn't exist
   */
  static async getEmployerBalance(companyId: string): Promise<number> {
    try {
      const wallet = await this.getEmployerWallet(companyId);
      return wallet ? wallet.balance : 0;
    } catch (error) {
      console.error('Error getting employer balance:', error);
      return 0;
    }
  }

  /**
   * Process payroll disbursement using wallet system
   * @param companyId Company ID
   * @param employeeId Employee ID
   * @param amount Amount to disburse
   * @returns Transaction result
   */
  static async processPayrollDisbursement(
    companyId: string,
    employeeId: string,
    amount: number
  ): Promise<TransactionResult> {
    try {
      // Get or create employer wallet
      let employerWallet = await this.getEmployerWallet(companyId);
      
      if (!employerWallet) {
        employerWallet = await this.createEmployerWallet(companyId);
      }
      
      // Get or create employee wallet
      let employeeWallet = await this.getEmployeeWallet(employeeId);
      
      if (!employeeWallet) {
        employeeWallet = await this.createEmployeeWallet(employeeId);
      }
      
      // Check if employer wallet has sufficient balance
      if (employerWallet.balance < amount) {
        return {
          success: false,
          error: 'Insufficient balance in employer wallet'
        };
      }
      
      // Transfer funds
      return await this.transferToEmployee(
        employerWallet.id,
        employeeId,
        amount,
        'Payroll disbursement'
      );
    } catch (error) {
      console.error('Error processing payroll disbursement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get wallet circuit breaker state
   * @returns Current state of the wallet circuit breaker
   */
  static getWalletCircuitBreakerState(): 'closed' | 'open' | 'half-open' {
    return walletCircuitBreaker.getState();
  }

  /**
   * Reset wallet circuit breaker
   */
  static resetWalletCircuitBreaker(): void {
    walletCircuitBreaker.reset();
  }
}