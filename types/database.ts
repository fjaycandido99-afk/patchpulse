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
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          preferred_platforms: string[]
          playstyle: string
          notifications_enabled: boolean
          onboarding_completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          preferred_platforms?: string[]
          playstyle?: string
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          preferred_platforms?: string[]
          playstyle?: string
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          id: string
          name: string
          slug: string
          cover_url: string | null
          hero_url: string | null
          platforms: string[]
          release_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          cover_url?: string | null
          hero_url?: string | null
          platforms?: string[]
          release_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          cover_url?: string | null
          hero_url?: string | null
          platforms?: string[]
          release_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_games: {
        Row: {
          id: string
          user_id: string
          game_id: string
          is_favorite: boolean
          notify_major_patches: boolean
          notify_all_patches: boolean
          notify_news: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          is_favorite?: boolean
          notify_major_patches?: boolean
          notify_all_patches?: boolean
          notify_news?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          is_favorite?: boolean
          notify_major_patches?: boolean
          notify_all_patches?: boolean
          notify_news?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_games_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_games_game_id_fkey'
            columns: ['game_id']
            referencedRelation: 'games'
            referencedColumns: ['id']
          }
        ]
      }
      patch_notes: {
        Row: {
          id: string
          game_id: string
          title: string
          published_at: string
          source_url: string | null
          raw_text: string | null
          summary_tldr: string | null
          key_changes: Json
          tags: string[]
          impact_score: number
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          title: string
          published_at: string
          source_url?: string | null
          raw_text?: string | null
          summary_tldr?: string | null
          key_changes?: Json
          tags?: string[]
          impact_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          title?: string
          published_at?: string
          source_url?: string | null
          raw_text?: string | null
          summary_tldr?: string | null
          key_changes?: Json
          tags?: string[]
          impact_score?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'patch_notes_game_id_fkey'
            columns: ['game_id']
            referencedRelation: 'games'
            referencedColumns: ['id']
          }
        ]
      }
      news_items: {
        Row: {
          id: string
          game_id: string | null
          title: string
          published_at: string
          source_name: string | null
          source_url: string | null
          summary: string | null
          why_it_matters: string | null
          topics: string[]
          is_rumor: boolean
          created_at: string
        }
        Insert: {
          id?: string
          game_id?: string | null
          title: string
          published_at: string
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          why_it_matters?: string | null
          topics?: string[]
          is_rumor?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string | null
          title?: string
          published_at?: string
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          why_it_matters?: string | null
          topics?: string[]
          is_rumor?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'news_items_game_id_fkey'
            columns: ['game_id']
            referencedRelation: 'games'
            referencedColumns: ['id']
          }
        ]
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          entity_type: string
          entity_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entity_type: string
          entity_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entity_type?: string
          entity_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
