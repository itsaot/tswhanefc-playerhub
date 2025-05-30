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
      club_photos: {
        Row: {
          description: string | null
          id: string
          photo_url: string
          title: string
          upload_date: string | null
          uploaded_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          photo_url: string
          title: string
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          photo_url?: string
          title?: string
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      coaching_staff: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          joined_year: string | null
          name: string
          photo_url: string | null
          qualifications: string | null
          role: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          joined_year?: string | null
          name: string
          photo_url?: string | null
          qualifications?: string | null
          role: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          joined_year?: string | null
          name?: string
          photo_url?: string | null
          qualifications?: string | null
          role?: string
        }
        Relationships: []
      }
      photo_likes: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_likes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "club_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          category: string
          created_at: string | null
          date_joined: string
          date_of_birth: string
          emergency_contact: string | null
          height: string | null
          id: string
          id_number: string
          medical_conditions: string | null
          name: string
          nationality: string
          photo_url: string | null
          position: string
          preferred_foot: string
          race: string
          registration_status: string
          safa_id: string | null
          surname: string
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          age: number
          category: string
          created_at?: string | null
          date_joined: string
          date_of_birth: string
          emergency_contact?: string | null
          height?: string | null
          id?: string
          id_number: string
          medical_conditions?: string | null
          name: string
          nationality: string
          photo_url?: string | null
          position: string
          preferred_foot: string
          race: string
          registration_status: string
          safa_id?: string | null
          surname: string
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          age?: number
          category?: string
          created_at?: string | null
          date_joined?: string
          date_of_birth?: string
          emergency_contact?: string | null
          height?: string | null
          id?: string
          id_number?: string
          medical_conditions?: string | null
          name?: string
          nationality?: string
          photo_url?: string | null
          position?: string
          preferred_foot?: string
          race?: string
          registration_status?: string
          safa_id?: string | null
          surname?: string
          updated_at?: string | null
          weight?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
