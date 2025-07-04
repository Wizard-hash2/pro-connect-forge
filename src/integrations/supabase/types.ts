export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      freelancer_profiles: {
        Row: {
          availability_hours_per_week: number | null
          bio: string | null
          completed_projects: number | null
          experience_level:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          hourly_rate: number | null
          id: string
          portfolio_url: string | null
          rating: number | null
        }
        Insert: {
          availability_hours_per_week?: number | null
          bio?: string | null
          completed_projects?: number | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          hourly_rate?: number | null
          id: string
          portfolio_url?: string | null
          rating?: number | null
        }
        Update: {
          availability_hours_per_week?: number | null
          bio?: string | null
          completed_projects?: number | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          hourly_rate?: number | null
          id?: string
          portfolio_url?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_skills: {
        Row: {
          freelancer_id: string
          proficiency_level: number | null
          skill_id: string
          years_experience: number | null
        }
        Insert: {
          freelancer_id: string
          proficiency_level?: number | null
          skill_id: string
          years_experience?: number | null
        }
        Update: {
          freelancer_id?: string
          proficiency_level?: number | null
          skill_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_skills_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          client_id: string | null
          deadline: string | null
          description: string | null
          id: string
          required_experience_level:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          status: Database["public"]["Enums"]["job_status_enum"] | null
          title: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string | null
          deadline?: string | null
          description?: string | null
          id: string
          required_experience_level?:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          status?: Database["public"]["Enums"]["job_status_enum"] | null
          title?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          required_experience_level?:
            | Database["public"]["Enums"]["experience_level_enum"]
            | null
          status?: Database["public"]["Enums"]["job_status_enum"] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          importance_weight: number | null
          is_required: boolean | null
          job_id: string
          skill_id: string
        }
        Insert: {
          importance_weight?: number | null
          is_required?: boolean | null
          job_id: string
          skill_id: string
        }
        Update: {
          importance_weight?: number | null
          is_required?: boolean | null
          job_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          compatibility_score: number | null
          created_at: string | null
          freelancer_id: string | null
          id: string
          job_id: string | null
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string | null
          freelancer_id?: string | null
          id: string
          job_id?: string | null
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string | null
          freelancer_id?: string | null
          id?: string
          job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id: string
          name?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      experience_level_enum: "junior" | "mid" | "senior" | "expert"
      job_status_enum: "open" | "in_progress" | "completed"
      user_type_enum: "client" | "freelancer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      experience_level_enum: ["junior", "mid", "senior", "expert"],
      job_status_enum: ["open", "in_progress", "completed"],
      user_type_enum: ["client", "freelancer"],
    },
  },
} as const
