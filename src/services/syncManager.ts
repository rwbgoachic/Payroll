import { supabase } from '../lib/supabase';
import { 
  getUnsyncedTransactions, 
  markTransactionSynced, 
  addOfflineTransaction,
  clearSyncedTransactions
} from '../lib/indexedDB';

// Define the types of transactions that can be synced
export type TransactionType = 
  | 'payroll_run'
  | 'time_entry'
  | 'deduction'
  | 'benefit'
  | 'tax_rate';

// Sync status for the application
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

// Sync manager class
export class SyncManager {
  private static instance: SyncManager;
  private syncInterval: number | null = null;
  private syncStatus: SyncStatus = 'idle';
  private lastSyncTime: Date | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];

  // Private constructor to enforce singleton pattern
  private constructor() {}

  // Get the singleton instance
  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Start the sync manager
  public start(intervalMs: number = 60000): void {
    if (this.syncInterval) {
      this.stop();
    }

    // Perform initial sync
    this.sync();

    // Set up interval for regular syncing
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, intervalMs);

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  // Stop the sync manager
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  // Add a listener for sync status changes
  public addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get the current sync status
  public getStatus(): { status: SyncStatus; lastSync: Date | null } {
    return {
      status: this.syncStatus,
      lastSync: this.lastSyncTime
    };
  }

  // Manually trigger a sync
  public async sync(): Promise<void> {
    if (this.syncStatus === 'syncing' || !navigator.onLine) {
      return;
    }

    try {
      this.updateStatus('syncing');

      // Get all unsynced transactions
      const unsyncedTransactions = await getUnsyncedTransactions();
      
      if (unsyncedTransactions.length === 0) {
        this.updateStatus('success');
        this.lastSyncTime = new Date();
        return;
      }

      // Group transactions by type for batch processing
      const transactionsByType = this.groupTransactionsByType(unsyncedTransactions);

      // Process each type of transaction
      for (const [type, transactions] of Object.entries(transactionsByType)) {
        await this.processTransactions(type as TransactionType, transactions);
      }

      // Clear synced transactions to save space
      await clearSyncedTransactions();

      this.updateStatus('success');
      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Sync error:', error);
      this.updateStatus('error');
    }
  }

  // Save data for offline use
  public async saveOfflineData(type: TransactionType, data: any): Promise<string> {
    return addOfflineTransaction(type, data);
  }

  // Pull data from the server for offline use
  public async pullData(type: TransactionType, query: any = {}): Promise<any[]> {
    try {
      // Fetch data from Supabase based on the transaction type
      const { data, error } = await this.fetchDataByType(type, query);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Error pulling ${type} data:`, error);
      throw error;
    }
  }

  // Private methods
  private updateStatus(status: SyncStatus): void {
    this.syncStatus = status;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  private handleOnline = (): void => {
    console.log('Device is online. Syncing...');
    this.sync();
  };

  private handleOffline = (): void => {
    console.log('Device is offline. Sync paused.');
    this.updateStatus('idle');
  };

  private groupTransactionsByType(transactions: any[]): Record<string, any[]> {
    return transactions.reduce((acc, transaction) => {
      const { type } = transaction;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(transaction);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private async processTransactions(type: TransactionType, transactions: any[]): Promise<void> {
    try {
      // Process transactions based on their type
      switch (type) {
        case 'payroll_run':
          await this.syncPayrollRuns(transactions);
          break;
        case 'time_entry':
          await this.syncTimeEntries(transactions);
          break;
        case 'deduction':
          await this.syncDeductions(transactions);
          break;
        case 'benefit':
          await this.syncBenefits(transactions);
          break;
        case 'tax_rate':
          await this.syncTaxRates(transactions);
          break;
        default:
          console.warn(`Unknown transaction type: ${type}`);
      }
    } catch (error) {
      console.error(`Error processing ${type} transactions:`, error);
      throw error;
    }
  }

  private async syncPayrollRuns(transactions: any[]): Promise<void> {
    for (const transaction of transactions) {
      try {
        const { data, error } = await supabase
          .from('payroll_runs')
          .upsert(transaction.data)
          .select();

        if (error) {
          throw error;
        }

        await markTransactionSynced(transaction.id);
      } catch (error) {
        console.error('Error syncing payroll run:', error);
        // Continue with other transactions even if one fails
      }
    }
  }

  private async syncTimeEntries(transactions: any[]): Promise<void> {
    for (const transaction of transactions) {
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .upsert(transaction.data)
          .select();

        if (error) {
          throw error;
        }

        await markTransactionSynced(transaction.id);
      } catch (error) {
        console.error('Error syncing time entry:', error);
      }
    }
  }

  private async syncDeductions(transactions: any[]): Promise<void> {
    for (const transaction of transactions) {
      try {
        const { data, error } = await supabase
          .from('deductions')
          .upsert(transaction.data)
          .select();

        if (error) {
          throw error;
        }

        await markTransactionSynced(transaction.id);
      } catch (error) {
        console.error('Error syncing deduction:', error);
      }
    }
  }

  private async syncBenefits(transactions: any[]): Promise<void> {
    for (const transaction of transactions) {
      try {
        const { data, error } = await supabase
          .from('benefits')
          .upsert(transaction.data)
          .select();

        if (error) {
          throw error;
        }

        await markTransactionSynced(transaction.id);
      } catch (error) {
        console.error('Error syncing benefit:', error);
      }
    }
  }

  private async syncTaxRates(transactions: any[]): Promise<void> {
    for (const transaction of transactions) {
      try {
        const { data, error } = await supabase
          .from('tax_rates')
          .upsert(transaction.data)
          .select();

        if (error) {
          throw error;
        }

        await markTransactionSynced(transaction.id);
      } catch (error) {
        console.error('Error syncing tax rate:', error);
      }
    }
  }

  private async fetchDataByType(type: TransactionType, query: any = {}): Promise<any> {
    switch (type) {
      case 'payroll_run':
        return supabase.from('payroll_runs').select('*').match(query);
      case 'time_entry':
        return supabase.from('time_entries').select('*').match(query);
      case 'deduction':
        return supabase.from('deductions').select('*').match(query);
      case 'benefit':
        return supabase.from('benefits').select('*').match(query);
      case 'tax_rate':
        return supabase.from('tax_rates').select('*').match(query);
      default:
        throw new Error(`Unknown transaction type: ${type}`);
    }
  }
}

// Export a singleton instance
export const syncManager = SyncManager.getInstance();