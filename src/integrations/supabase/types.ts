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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ghost_accounts: {
        Row: {
          converted_at: string | null
          converted_to_user_id: string | null
          created_at: string
          id: string
          jar_ids: string[] | null
          session_id: string
        }
        Insert: {
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string
          id?: string
          jar_ids?: string[] | null
          session_id: string
        }
        Update: {
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string
          id?: string
          jar_ids?: string[] | null
          session_id?: string
        }
        Relationships: []
      }
      jar_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          jar_id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          jar_id: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          jar_id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jar_activity_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "jars"
            referencedColumns: ["id"]
          },
        ]
      }
      jar_charms: {
        Row: {
          charm_type: string
          color: string | null
          created_at: string
          id: string
          jar_id: string
          position_x: number
          position_y: number
          rotation: number
          scale: number
        }
        Insert: {
          charm_type: string
          color?: string | null
          created_at?: string
          id?: string
          jar_id: string
          position_x?: number
          position_y?: number
          rotation?: number
          scale?: number
        }
        Update: {
          charm_type?: string
          color?: string | null
          created_at?: string
          id?: string
          jar_id?: string
          position_x?: number
          position_y?: number
          rotation?: number
          scale?: number
        }
        Relationships: [
          {
            foreignKeyName: "jar_charms_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "jars"
            referencedColumns: ["id"]
          },
        ]
      }
      jar_notes: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          jar_id: string
          media_url: string | null
          note_order: number
          note_theme: string | null
          opened_at: string | null
        }
        Insert: {
          content: string
          content_type?: string
          created_at?: string
          id?: string
          jar_id: string
          media_url?: string | null
          note_order?: number
          note_theme?: string | null
          opened_at?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          jar_id?: string
          media_url?: string | null
          note_order?: number
          note_theme?: string | null
          opened_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jar_notes_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "jars"
            referencedColumns: ["id"]
          },
        ]
      }
      jar_owners: {
        Row: {
          added_at: string
          id: string
          jar_id: string
          role: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          jar_id: string
          role?: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          jar_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jar_owners_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "jars"
            referencedColumns: ["id"]
          },
        ]
      }
      jar_shares: {
        Row: {
          accepted_at: string | null
          id: string
          jar_id: string
          permission: string
          shared_at: string
          shared_by_user_id: string
          shared_to_email: string | null
          shared_to_user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          jar_id: string
          permission?: string
          shared_at?: string
          shared_by_user_id: string
          shared_to_email?: string | null
          shared_to_user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          id?: string
          jar_id?: string
          permission?: string
          shared_at?: string
          shared_by_user_id?: string
          shared_to_email?: string | null
          shared_to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jar_shares_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "jars"
            referencedColumns: ["id"]
          },
        ]
      }
      jar_user_state: {
        Row: {
          created_at: string
          id: string
          jar_id: string
          last_opened_at: string | null
          last_opened_date: string | null
          notes_opened_today: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          jar_id: string
          last_opened_at?: string | null
          last_opened_date?: string | null
          notes_opened_today?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          jar_id?: string
          last_opened_at?: string | null
          last_opened_date?: string | null
          notes_opened_today?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jar_user_state_jar_id_fkey"
            columns: ["jar_id"]
            isOneToOne: false
            referencedRelation: "jars"
            referencedColumns: ["id"]
          },
        ]
      }
      jars: {
        Row: {
          created_at: string
          ghost_session_id: string | null
          id: string
          is_password_protected: boolean | null
          name: string
          open_mode: string
          password_hash: string | null
          recipient_email: string | null
          recipient_name: string | null
          share_token: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ghost_session_id?: string | null
          id?: string
          is_password_protected?: boolean | null
          name?: string
          open_mode?: string
          password_hash?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          share_token?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ghost_session_id?: string | null
          id?: string
          is_password_protected?: boolean | null
          name?: string
          open_mode?: string
          password_hash?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          share_token?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_ghost_account: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: undefined
      }
      is_jar_owner_or_creator: {
        Args: { p_jar_id: string; p_user_id: string }
        Returns: boolean
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
