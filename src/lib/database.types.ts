export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      trends: {
        Row: {
          id: string
          topic: string
          source: string | null
          score: number | null
          region: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          topic: string
          source?: string | null
          score?: number | null
          region?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          topic?: string
          source?: string | null
          score?: number | null
          region?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      offers: {
        Row: {
          id: string
          merchant: string
          product: string
          commission_type: string | null
          rate: string | null
          deeplink_template: string
          network: string | null
          approved: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          merchant: string
          product: string
          commission_type?: string | null
          rate?: string | null
          deeplink_template: string
          network?: string | null
          approved?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          merchant?: string
          product?: string
          commission_type?: string | null
          rate?: string | null
          deeplink_template?: string
          network?: string | null
          approved?: boolean | null
          created_at?: string | null
        }
      }
      trend_offers: {
        Row: {
          trend_id: string
          offer_id: string
          fit_score: number | null
        }
        Insert: {
          trend_id: string
          offer_id: string
          fit_score?: number | null
        }
        Update: {
          trend_id?: string
          offer_id?: string
          fit_score?: number | null
        }
      }
      assets: {
        Row: {
          id: string
          trend_id: string | null
          offer_id: string | null
          type: string | null
          path: string | null
          status: string | null
          metrics_json: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          trend_id?: string | null
          offer_id?: string | null
          type?: string | null
          path?: string | null
          status?: string | null
          metrics_json?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          trend_id?: string | null
          offer_id?: string | null
          type?: string | null
          path?: string | null
          status?: string | null
          metrics_json?: Json | null
          created_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          asset_id: string | null
          platform: string | null
          status: string | null
          scheduled_at: string | null
          published_at: string | null
          url: string | null
          impressions: number | null
          clicks: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          asset_id?: string | null
          platform?: string | null
          status?: string | null
          scheduled_at?: string | null
          published_at?: string | null
          url?: string | null
          impressions?: number | null
          clicks?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          asset_id?: string | null
          platform?: string | null
          status?: string | null
          scheduled_at?: string | null
          published_at?: string | null
          url?: string | null
          impressions?: number | null
          clicks?: number | null
          created_at?: string | null
        }
      }
      clicks: {
        Row: {
          id: number
          post_id: string | null
          link_slug: string | null
          ip_hash: string | null
          ua_hash: string | null
          ts: string | null
        }
        Insert: {
          id?: number
          post_id?: string | null
          link_slug?: string | null
          ip_hash?: string | null
          ua_hash?: string | null
          ts?: string | null
        }
        Update: {
          id?: number
          post_id?: string | null
          link_slug?: string | null
          ip_hash?: string | null
          ua_hash?: string | null
          ts?: string | null
        }
      }
      conversions: {
        Row: {
          id: number
          network: string
          click_ref: string | null
          amount: number | null
          commission: number | null
          ts: string | null
        }
        Insert: {
          id?: number
          network: string
          click_ref?: string | null
          amount?: number | null
          commission?: number | null
          ts?: string | null
        }
        Update: {
          id?: number
          network?: string
          click_ref?: string | null
          amount?: number | null
          commission?: number | null
          ts?: string | null
        }
      }
    }
  }
}
