
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          name: string;
          email: string;
          image_url: string | null;
          profile_image_url: string | null;
          bio: string | null;
          headline: string | null;
          full_bio: string | null;
          twitter: string | null;
          instagram: string | null;
          linkedin: string | null;
          website: string | null;
          verified: boolean;
          role: 'admin' | 'normal';
          subscription_credits: number;
          subscription_active: boolean;
          subscription_start_date: string | null;
          free_trial_claimed: boolean;
          free_trial_active: boolean;
          free_trial_start_date: string | null;
          karma_points: number;
          ad_free: boolean;
          is_new_user: boolean;
          reset_token: string | null;
          reset_token_expiry: string | null;
          unsubscribed: boolean;
          hashed_password: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          name: string;
          email: string;
          image_url?: string | null;
          profile_image_url?: string | null;
          bio?: string | null;
          headline?: string | null;
          full_bio?: string | null;
          twitter?: string | null;
          instagram?: string | null;
          linkedin?: string | null;
          website?: string | null;
          verified?: boolean;
          role?: 'admin' | 'normal';
          subscription_credits?: number;
          subscription_active?: boolean;
          subscription_start_date?: string | null;
          free_trial_claimed?: boolean;
          free_trial_active?: boolean;
          free_trial_start_date?: string | null;
          karma_points?: number;
          ad_free?: boolean;
          is_new_user?: boolean;
          reset_token?: string | null;
          reset_token_expiry?: string | null;
          unsubscribed?: boolean;
          hashed_password?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
