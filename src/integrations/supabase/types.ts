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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          id: number
          market_cap: string | null
          name: string
          screener_slug: string
          sector: string | null
          symbol: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          market_cap?: string | null
          name: string
          screener_slug: string
          sector?: string | null
          symbol: string
        }
        Update: {
          created_at?: string | null
          id?: number
          market_cap?: string | null
          name?: string
          screener_slug?: string
          sector?: string | null
          symbol?: string
        }
        Relationships: []
      }
      earnings_analyses: {
        Row: {
          analysis_cost_usd: number | null
          analysis_model: string | null
          analyzed_at: string | null
          bear_case: string | null
          bull_case: string | null
          company_id: number | null
          dodged_questions: Json | null
          green_flags: Json | null
          guidance: Json | null
          id: number
          investment_signal: string | null
          key_numbers: Json | null
          key_takeaways: Json | null
          margin_analysis: Json | null
          mgmt_confidence: number | null
          mgmt_tone: string | null
          next_quarter_watchlist: Json | null
          ppt_url: string | null
          quarter: string
          raw_transcript: string | null
          recording_url: string | null
          red_flags: Json | null
          revenue_analysis: Json | null
          risks: Json | null
          screener_summary: string | null
          sentiment_components: Json | null
          sentiment_label: string | null
          sentiment_score: number | null
          signal_rationale: string | null
          summary: string | null
          tone_evidence: Json | null
          transcript_date: string | null
          transcript_url: string | null
        }
        Insert: {
          analysis_cost_usd?: number | null
          analysis_model?: string | null
          analyzed_at?: string | null
          bear_case?: string | null
          bull_case?: string | null
          company_id?: number | null
          dodged_questions?: Json | null
          green_flags?: Json | null
          guidance?: Json | null
          id?: number
          investment_signal?: string | null
          key_numbers?: Json | null
          key_takeaways?: Json | null
          margin_analysis?: Json | null
          mgmt_confidence?: number | null
          mgmt_tone?: string | null
          next_quarter_watchlist?: Json | null
          ppt_url?: string | null
          quarter: string
          raw_transcript?: string | null
          recording_url?: string | null
          red_flags?: Json | null
          revenue_analysis?: Json | null
          risks?: Json | null
          screener_summary?: string | null
          sentiment_components?: Json | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          signal_rationale?: string | null
          summary?: string | null
          tone_evidence?: Json | null
          transcript_date?: string | null
          transcript_url?: string | null
        }
        Update: {
          analysis_cost_usd?: number | null
          analysis_model?: string | null
          analyzed_at?: string | null
          bear_case?: string | null
          bull_case?: string | null
          company_id?: number | null
          dodged_questions?: Json | null
          green_flags?: Json | null
          guidance?: Json | null
          id?: number
          investment_signal?: string | null
          key_numbers?: Json | null
          key_takeaways?: Json | null
          margin_analysis?: Json | null
          mgmt_confidence?: number | null
          mgmt_tone?: string | null
          next_quarter_watchlist?: Json | null
          ppt_url?: string | null
          quarter?: string
          raw_transcript?: string | null
          recording_url?: string | null
          red_flags?: Json | null
          revenue_analysis?: Json | null
          risks?: Json | null
          screener_summary?: string | null
          sentiment_components?: Json | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          signal_rationale?: string | null
          summary?: string | null
          tone_evidence?: Json | null
          transcript_date?: string | null
          transcript_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earnings_analyses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      latest_analyses: {
        Row: {
          analysis_cost_usd: number | null
          analysis_model: string | null
          analyzed_at: string | null
          bear_case: string | null
          bull_case: string | null
          company_id: number | null
          dodged_questions: Json | null
          green_flags: Json | null
          guidance: Json | null
          id: number | null
          investment_signal: string | null
          key_numbers: Json | null
          key_takeaways: Json | null
          margin_analysis: Json | null
          market_cap: string | null
          mgmt_confidence: number | null
          mgmt_tone: string | null
          name: string | null
          next_quarter_watchlist: Json | null
          ppt_url: string | null
          quarter: string | null
          raw_transcript: string | null
          recording_url: string | null
          red_flags: Json | null
          revenue_analysis: Json | null
          risks: Json | null
          screener_summary: string | null
          sector: string | null
          sentiment_components: Json | null
          sentiment_label: string | null
          sentiment_score: number | null
          signal_rationale: string | null
          summary: string | null
          symbol: string | null
          tone_evidence: Json | null
          transcript_date: string | null
          transcript_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earnings_analyses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sentiment_rankings: {
        Row: {
          investment_signal: string | null
          mgmt_tone: string | null
          name: string | null
          quarter: string | null
          sector: string | null
          sentiment_label: string | null
          sentiment_score: number | null
          summary: string | null
          symbol: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
