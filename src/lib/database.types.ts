type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          ein: string
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          ein: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          ein?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string | null
          company_id: string | null
          first_name: string
          last_name: string
          email: string
          department: string | null
          position: string | null
          hire_date: string
          termination_date: string | null
          status: string | null
          salary_type: string
          salary_amount: number
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          first_name: string
          last_name: string
          email: string
          department?: string | null
          position?: string | null
          hire_date: string
          termination_date?: string | null
          status?: string | null
          salary_type: string
          salary_amount: number
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          department?: string | null
          position?: string | null
          hire_date?: string
          termination_date?: string | null
          status?: string | null
          salary_type?: string
          salary_amount?: number
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}