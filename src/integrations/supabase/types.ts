export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: string
          close_day: number | null
          created_at: string
          currency: string
          due_day: number | null
          id: string
          is_active: boolean
          name: string
          owner_entity_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          close_day?: number | null
          created_at?: string
          currency?: string
          due_day?: number | null
          id?: string
          is_active?: boolean
          name: string
          owner_entity_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          close_day?: number | null
          created_at?: string
          currency?: string
          due_day?: number | null
          id?: string
          is_active?: boolean
          name?: string
          owner_entity_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_owner_entity_id_fkey"
            columns: ["owner_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      adjustments: {
        Row: {
          amount: number
          created_at: string
          entity_id: string
          id: string
          invoice_id: string | null
          kind: string
          note: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          entity_id: string
          id?: string
          invoice_id?: string | null
          kind: string
          note?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          entity_id?: string
          id?: string
          invoice_id?: string | null
          kind?: string
          note?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adjustments_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_open_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_cash_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_pl_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_pl_personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          payload: Json
          row_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: number
          payload?: Json
          row_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: number
          payload?: Json
          row_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          name: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string
          entity_type: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      imports: {
        Row: {
          account_id: string
          created_at: string
          file_hash: string | null
          id: string
          metadata: Json
          period_end: string | null
          period_start: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          file_hash?: string | null
          id?: string
          metadata?: Json
          period_end?: string | null
          period_start?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          file_hash?: string | null
          id?: string
          metadata?: Json
          period_end?: string | null
          period_start?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imports_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          invoice_id: string
          transaction_id: string
        }
        Insert: {
          invoice_id: string
          transaction_id: string
        }
        Update: {
          invoice_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_open_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_cash_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_pl_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_pl_personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          account_id: string
          created_at: string
          cycle_end: string
          cycle_start: string
          due_date: string
          id: string
          metadata: Json
          paid_amount: number | null
          paid_at: string | null
          payer_account_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          cycle_end: string
          cycle_start: string
          due_date: string
          id?: string
          metadata?: Json
          paid_amount?: number | null
          paid_at?: string | null
          payer_account_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          cycle_end?: string
          cycle_start?: string
          due_date?: string
          id?: string
          metadata?: Json
          paid_amount?: number | null
          paid_at?: string | null
          payer_account_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payer_account_id_fkey"
            columns: ["payer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      local_rules: {
        Row: {
          account_id: string | null
          created_at: string
          entity_id: string | null
          id: string
          is_active: boolean
          match_type: string
          pattern: string
          priority: number
          scope: string
          suggest_category_id: string | null
          suggest_entity_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_active?: boolean
          match_type: string
          pattern: string
          priority?: number
          scope?: string
          suggest_category_id?: string | null
          suggest_entity_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_active?: boolean
          match_type?: string
          pattern?: string
          priority?: number
          scope?: string
          suggest_category_id?: string | null
          suggest_entity_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_rules_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_rules_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_rules_suggest_category_id_fkey"
            columns: ["suggest_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_rules_suggest_entity_id_fkey"
            columns: ["suggest_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          metadata: Json
          paid_at: string | null
          provider: string
          reference: string | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          metadata?: Json
          paid_at?: string | null
          provider: string
          reference?: string | null
          status: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          metadata?: Json
          paid_at?: string | null
          provider?: string
          reference?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          code: string
          created_at: string
          is_active: boolean
          limits: Json
          name: string
          period: string
          price_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          is_active?: boolean
          limits?: Json
          name: string
          period: string
          price_cents: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          is_active?: boolean
          limits?: Json
          name?: string
          period?: string
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_rules: {
        Row: {
          account_id: string | null
          amount: number | null
          category_id: string | null
          created_at: string
          entity_id: string
          id: string
          is_paused: boolean
          last_run_at: string | null
          next_run_at: string | null
          rrule: string
          template: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount?: number | null
          category_id?: string | null
          created_at?: string
          entity_id: string
          id?: string
          is_paused?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          rrule: string
          template?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number | null
          category_id?: string | null
          created_at?: string
          entity_id?: string
          id?: string
          is_paused?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          rrule?: string
          template?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_rules_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_rules_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      staging_transactions: {
        Row: {
          account_id: string
          ai_category_hint: string | null
          ai_confidence: number | null
          amount: number
          created_at: string
          description: string
          description_hash: string | null
          description_norm: string | null
          external_id: string | null
          id: string
          import_id: string
          lock_owner: string | null
          locked_at: string | null
          metadata: Json
          status: string
          suggested_category_id: string | null
          suggested_entity_id: string | null
          txn_date: string
          user_id: string
          version: number
        }
        Insert: {
          account_id: string
          ai_category_hint?: string | null
          ai_confidence?: number | null
          amount: number
          created_at?: string
          description: string
          description_hash?: string | null
          description_norm?: string | null
          external_id?: string | null
          id?: string
          import_id: string
          lock_owner?: string | null
          locked_at?: string | null
          metadata?: Json
          status?: string
          suggested_category_id?: string | null
          suggested_entity_id?: string | null
          txn_date: string
          user_id: string
          version?: number
        }
        Update: {
          account_id?: string
          ai_category_hint?: string | null
          ai_confidence?: number | null
          amount?: number
          created_at?: string
          description?: string
          description_hash?: string | null
          description_norm?: string | null
          external_id?: string | null
          id?: string
          import_id?: string
          lock_owner?: string | null
          locked_at?: string | null
          metadata?: Json
          status?: string
          suggested_category_id?: string | null
          suggested_entity_id?: string | null
          txn_date?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "staging_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staging_transactions_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staging_transactions_suggested_category_id_fkey"
            columns: ["suggested_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staging_transactions_suggested_entity_id_fkey"
            columns: ["suggested_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          id: string
          metadata: Json
          plan_code: string
          status: string
          trial_until: string | null
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          plan_code: string
          status: string
          trial_until?: string | null
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          plan_code?: string
          status?: string
          trial_until?: string | null
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          counts_in_company_result: boolean
          counts_in_personal_result: boolean
          created_at: string
          description: string
          economic_nature: string | null
          entity_id: string
          id: string
          installment_n: number | null
          installment_of: number | null
          installment_plan_id: string | null
          invoice_id: string | null
          kind: string
          metadata: Json
          parent_id: string | null
          transfer_group_id: string | null
          txn_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          counts_in_company_result?: boolean
          counts_in_personal_result?: boolean
          created_at?: string
          description: string
          economic_nature?: string | null
          entity_id: string
          id?: string
          installment_n?: number | null
          installment_of?: number | null
          installment_plan_id?: string | null
          invoice_id?: string | null
          kind: string
          metadata?: Json
          parent_id?: string | null
          transfer_group_id?: string | null
          txn_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          counts_in_company_result?: boolean
          counts_in_personal_result?: boolean
          created_at?: string
          description?: string
          economic_nature?: string | null
          entity_id?: string
          id?: string
          installment_n?: number | null
          installment_of?: number | null
          installment_plan_id?: string | null
          invoice_id?: string | null
          kind?: string
          metadata?: Json
          parent_id?: string | null
          transfer_group_id?: string | null
          txn_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_open_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_cash_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_cash_ledger: {
        Row: {
          account_id: string | null
          account_name: string | null
          account_type: string | null
          amount: number | null
          category_id: string | null
          category_name: string | null
          counts_in_company_result: boolean | null
          counts_in_personal_result: boolean | null
          created_at: string | null
          description: string | null
          economic_nature: string | null
          entity_id: string | null
          entity_name: string | null
          id: string | null
          inflow: number | null
          installment_n: number | null
          installment_of: number | null
          installment_plan_id: string | null
          invoice_id: string | null
          kind: string | null
          metadata: Json | null
          month: string | null
          outflow: number | null
          parent_id: string | null
          running_balance: number | null
          transfer_group_id: string | null
          txn_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_open_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_cash_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      v_daily_cash_by_account: {
        Row: {
          account_id: string | null
          day: string | null
          day_balance: number | null
          day_delta: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      v_invoice_summaries: {
        Row: {
          account_id: string | null
          created_at: string | null
          cycle_end: string | null
          cycle_start: string | null
          due_date: string | null
          id: string | null
          invoice_total: number | null
          paid_amount: number | null
          paid_at: string | null
          payer_account_id: string | null
          remaining_amount: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payer_account_id_fkey"
            columns: ["payer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      v_monthly_cashflow_by_account: {
        Row: {
          account_id: string | null
          cash_in: number | null
          cash_out: number | null
          month: string | null
          net_cash: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      v_open_invoices: {
        Row: {
          account_id: string | null
          created_at: string | null
          cycle_end: string | null
          cycle_start: string | null
          due_date: string | null
          id: string | null
          invoice_total: number | null
          paid_amount: number | null
          paid_at: string | null
          payer_account_id: string | null
          remaining_amount: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payer_account_id_fkey"
            columns: ["payer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pl_company: {
        Row: {
          account_id: string | null
          account_name: string | null
          account_type: string | null
          amount: number | null
          category_id: string | null
          category_name: string | null
          counts_in_company_result: boolean | null
          counts_in_personal_result: boolean | null
          created_at: string | null
          description: string | null
          economic_nature: string | null
          entity_id: string | null
          entity_name: string | null
          id: string | null
          inflow: number | null
          installment_n: number | null
          installment_of: number | null
          installment_plan_id: string | null
          invoice_id: string | null
          kind: string | null
          metadata: Json | null
          month: string | null
          outflow: number | null
          parent_id: string | null
          transfer_group_id: string | null
          txn_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_open_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_cash_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pl_company_monthly: {
        Row: {
          expenses: number | null
          income: number | null
          month: string | null
          net_result: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_pl_personal: {
        Row: {
          account_id: string | null
          account_name: string | null
          account_type: string | null
          amount: number | null
          category_id: string | null
          category_name: string | null
          counts_in_company_result: boolean | null
          counts_in_personal_result: boolean | null
          created_at: string | null
          description: string | null
          economic_nature: string | null
          entity_id: string | null
          entity_name: string | null
          id: string | null
          inflow: number | null
          installment_n: number | null
          installment_of: number | null
          installment_plan_id: string | null
          invoice_id: string | null
          kind: string | null
          metadata: Json | null
          month: string | null
          outflow: number | null
          parent_id: string | null
          transfer_group_id: string | null
          txn_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_open_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_cash_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pl_personal_monthly: {
        Row: {
          expenses: number | null
          income: number | null
          month: string | null
          net_result: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_transactions_enriched: {
        Row: {
          account_id: string | null
          account_name: string | null
          account_type: string | null
          amount: number | null
          category_id: string | null
          category_name: string | null
          counts_in_company_result: boolean | null
          counts_in_personal_result: boolean | null
          created_at: string | null
          description: string | null
          economic_nature: string | null
          entity_id: string | null
          entity_name: string | null
          id: string | null
          inflow: number | null
          installment_n: number | null
          installment_of: number | null
          installment_plan_id: string | null
          invoice_id: string | null
          kind: string | null
          metadata: Json | null
          month: string | null
          outflow: number | null
          parent_id: string | null
          transfer_group_id: string | null
          txn_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_invoice_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_open_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_cash_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_pl_personal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      v_transfers: {
        Row: {
          amount_abs: number | null
          description: string | null
          from_account_id: string | null
          from_account_name: string | null
          to_account_id: string | null
          to_account_name: string | null
          transfer_group_id: string | null
          txn_date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { p_uid?: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
