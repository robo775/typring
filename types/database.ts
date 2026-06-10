export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          allow_external_typing: boolean;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string;
          id: string;
          is_admin: boolean;
          show_quiz_history: boolean;
          subscription_tier: "free" | "supporter";
          twitter_handle: string | null;
          twitter_id: string | null;
          updated_at: string;
        };
        Insert: {
          allow_external_typing?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          is_admin?: boolean;
          show_quiz_history?: boolean;
          subscription_tier?: "free" | "supporter";
          twitter_handle?: string | null;
          twitter_id?: string | null;
          updated_at?: string;
        };
        Update: {
          allow_external_typing?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          is_admin?: boolean;
          show_quiz_history?: boolean;
          subscription_tier?: "free" | "supporter";
          twitter_handle?: string | null;
          twitter_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      type_systems: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          position: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          position?: number;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          position?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      type_values: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          position: number;
          type_system_id: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          position?: number;
          type_system_id: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          position?: number;
          type_system_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_types: {
        Row: {
          created_at: string;
          type_system_id: string;
          type_value_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          type_system_id: string;
          type_value_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          type_system_id?: string;
          type_value_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      type_votes: {
        Row: {
          created_at: string;
          id: string;
          target_user_id: string;
          type_system_id: string;
          type_value_id: string;
          updated_at: string;
          voter_user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          target_user_id: string;
          type_system_id: string;
          type_value_id: string;
          updated_at?: string;
          voter_user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          target_user_id?: string;
          type_system_id?: string;
          type_value_id?: string;
          updated_at?: string;
          voter_user_id?: string;
        };
        Relationships: [];
      };
      profile_introductions: {
        Row: {
          author_user_id: string;
          body: string;
          created_at: string;
          id: string;
          target_user_id: string;
          updated_at: string;
        };
        Insert: {
          author_user_id: string;
          body: string;
          created_at?: string;
          id?: string;
          target_user_id: string;
          updated_at?: string;
        };
        Update: {
          author_user_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          target_user_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      social_accounts: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          handle: string;
          id: string;
          last_follow_sync_at: string | null;
          provider: "twitter";
          provider_user_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          handle: string;
          id?: string;
          last_follow_sync_at?: string | null;
          provider?: "twitter";
          provider_user_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          handle?: string;
          id?: string;
          last_follow_sync_at?: string | null;
          provider?: "twitter";
          provider_user_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      x_follow_edges: {
        Row: {
          cached_at: string;
          created_at: string;
          follower_account_id: string;
          following_account_id: string;
        };
        Insert: {
          cached_at?: string;
          created_at?: string;
          follower_account_id: string;
          following_account_id: string;
        };
        Update: {
          cached_at?: string;
          created_at?: string;
          follower_account_id?: string;
          following_account_id?: string;
        };
        Relationships: [];
      };
      compatibility_results: {
        Row: {
          created_at: string;
          id: string;
          input_hash: string;
          model: string | null;
          requester_user_id: string;
          result_text: string;
          target_user_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          input_hash: string;
          model?: string | null;
          requester_user_id: string;
          result_text: string;
          target_user_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          input_hash?: string;
          model?: string | null;
          requester_user_id?: string;
          result_text?: string;
          target_user_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_usage_logs: {
        Row: {
          created_at: string;
          feature: string;
          id: string;
          used_on: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          feature: string;
          id?: string;
          used_on?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          feature?: string;
          id?: string;
          used_on?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      admin_logs: {
        Row: {
          action: string;
          admin_user_id: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          target_id: string | null;
          target_table: string;
        };
        Insert: {
          action: string;
          admin_user_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_table: string;
        };
        Update: {
          action?: string;
          admin_user_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_table?: string;
        };
        Relationships: [];
      };
      pyramid_creations: {
        Row: {
          background_id: string;
          category_count: number;
          created_at: string;
          id: string;
          is_public: boolean;
          part_count: number;
          placed_parts: Json;
          title: string;
          total_score: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          background_id: string;
          category_count?: number;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          part_count?: number;
          placed_parts?: Json;
          title: string;
          total_score?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          background_id?: string;
          category_count?: number;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          part_count?: number;
          placed_parts?: Json;
          title?: string;
          total_score?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_type_vote_summary: {
        Args: {
          p_target_user_id: string;
        };
        Returns: {
          first_voted_at: string | null;
          total_count: number;
          type_system_id: string;
          type_value_id: string;
          vote_count: number;
        }[];
      };
      get_user_level_summaries: {
        Args: {
          p_user_ids: string[];
        };
        Returns: {
          introductions_received_points: number;
          introductions_written_points: number;
          level: number;
          next_level_points: number;
          poll_answer_points: number;
          poll_received_points: number;
          self_type_points: number;
          total_points: number;
          user_id: string;
          votes_given_points: number;
          votes_received_points: number;
        }[];
      };
      get_user_level_summary: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          introductions_received_points: number;
          introductions_written_points: number;
          level: number;
          next_level_points: number;
          poll_answer_points: number;
          poll_received_points: number;
          self_type_points: number;
          total_points: number;
          user_id: string;
          votes_given_points: number;
          votes_received_points: number;
        }[];
      };
      get_type_vote_rankings: {
        Args: {
          p_limit?: number | null;
          p_type_system_id?: string | null;
          p_type_value_id?: string | null;
        };
        Returns: {
          avatar_url: string | null;
          display_name: string;
          percentage: number;
          target_user_id: string;
          total_count: number;
          twitter_handle: string | null;
          type_system_id: string;
          type_value_id: string;
          vote_count: number;
        }[];
      };
      get_public_quiz_history: {
        Args: {
          p_limit?: number | null;
          p_user_id: string;
        };
        Returns: {
          attempt_id: string;
          created_at: string;
          quiz_slug: string;
          quiz_title: string;
          result_name: string | null;
        }[];
      };
      get_quiz_attempt_count: {
        Args: {
          p_quiz_id: string;
        };
        Returns: number;
      };
      get_recent_quiz_attempts: {
        Args: {
          p_limit?: number | null;
          p_quiz_id: string;
        };
        Returns: {
          attempt_id: string;
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          result_name: string | null;
          twitter_handle: string | null;
          user_id: string;
        }[];
      };
      get_x_mutual_profile_ids: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          mutual_user_id: string;
        }[];
      };
      is_x_mutual: {
        Args: {
          p_target_user_id: string;
          p_viewer_user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
