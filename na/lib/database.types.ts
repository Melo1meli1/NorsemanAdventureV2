export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      tours: {
        Row: {
          created_at: string;
          end_date: string | null;
          id: string;
          image_url: string | null;
          long_description: string | null;
          hoydepunkter: string | null;
          price: number;
          seats_available: number;
          total_seats: number;
          sesong: Database["public"]["Enums"]["sesong"] | null;
          short_description: string | null;
          start_date: string;
          status: Database["public"]["Enums"]["tour_status"];
          sted: string | null;
          terreng: Database["public"]["Enums"]["terreng"] | null;
          title: string;
          updated_at: string;
          vanskelighetsgrad:
            | Database["public"]["Enums"]["vanskelighetsgrad"]
            | null;
        };
        Insert: {
          created_at?: string;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          long_description?: string | null;
          hoydepunkter?: string | null;
          price: number;
          seats_available: number;
          total_seats: number;
          sesong?: Database["public"]["Enums"]["sesong"] | null;
          short_description?: string | null;
          start_date: string;
          status?: Database["public"]["Enums"]["tour_status"];
          sted?: string | null;
          terreng?: Database["public"]["Enums"]["terreng"] | null;
          title: string;
          updated_at?: string;
          vanskelighetsgrad?:
            | Database["public"]["Enums"]["vanskelighetsgrad"]
            | null;
        };
        Update: {
          created_at?: string;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          long_description?: string | null;
          hoydepunkter?: string | null;
          price?: number;
          seats_available?: number;
          total_seats?: number;
          sesong?: Database["public"]["Enums"]["sesong"] | null;
          short_description?: string | null;
          start_date?: string;
          status?: Database["public"]["Enums"]["tour_status"];
          sted?: string | null;
          terreng?: Database["public"]["Enums"]["terreng"] | null;
          title?: string;
          updated_at?: string;
          vanskelighetsgrad?:
            | Database["public"]["Enums"]["vanskelighetsgrad"]
            | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          navn: string;
          epost: string;
          dato: string;
          status: Database["public"]["Enums"]["booking_status"];
          belop: number;
          betalt_belop: number | null;
          type: Database["public"]["Enums"]["booking_type"];
          tour_id: string | null;
          telefon: string;
          notater: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          navn: string;
          epost: string;
          dato: string;
          status: Database["public"]["Enums"]["booking_status"];
          belop: number;
          betalt_belop?: number | null;
          type?: Database["public"]["Enums"]["booking_type"];
          tour_id?: string | null;
          telefon: string;
          notater?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          navn?: string;
          epost?: string;
          dato?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          belop?: number;
          betalt_belop?: number | null;
          type?: Database["public"]["Enums"]["booking_type"];
          tour_id?: string | null;
          telefon?: string;
          notater?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
      participants: {
        Row: {
          id: string;
          booking_id: string;
          name: string;
          email: string;
          telefon: string;
          sos_navn: string;
          sos_telefon: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          name: string;
          email: string;
          telefon: string;
          sos_navn: string;
          sos_telefon: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          name?: string;
          email?: string;
          telefon?: string;
          sos_navn?: string;
          sos_telefon?: string;
        };
        Relationships: [
          {
            foreignKeyName: "participants_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      public_gallery_images: {
        Row: {
          id: string;
          tour_id: string | null;
          file_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id?: string | null;
          file_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tour_id?: string | null;
          file_path?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_gallery_images_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      sesong: "sommer" | "vinter";
      terreng: "asfalt" | "grus" | "blandet";
      tour_status: "draft" | "published";
      vanskelighetsgrad: "nybegynner" | "intermediær" | "erfaren" | "ekspert";
      booking_type: "tur";
      booking_status:
        | "betalt"
        | "ikke_betalt"
        | "venteliste"
        | "kansellert"
        | "delvis_betalt";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals["public"]["Tables"] &
  DatabaseWithoutInternals["public"]["Views"];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema
    ? DefaultSchema[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema
    ? DefaultSchema[DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema
    ? DefaultSchema[DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      sesong: ["sommer", "vinter"],
      terreng: ["asfalt", "grus", "blandet"],
      tour_status: ["draft", "published"],
      vanskelighetsgrad: ["nybegynner", "intermediær", "erfaren", "ekspert"],
      booking_type: ["tur"],
      booking_status: [
        "betalt",
        "ikke_betalt",
        "venteliste",
        "kansellert",
        "delvis_betalt",
      ],
    },
  },
} as const;
