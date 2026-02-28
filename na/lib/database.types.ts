export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          belop: number;
          betalt_belop: number | null;
          created_at: string;
          dato: string;
          epost: string;
          id: string;
          navn: string;
          notater: string | null;
          reservation_expires_at: string | null;
          reservation_notified_at: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          telefon: string;
          tour_id: string | null;
          type: Database["public"]["Enums"]["booking_type"];
          waitlist_promoted_at: string | null;
        };
        Insert: {
          belop: number;
          betalt_belop?: number | null;
          created_at?: string;
          dato: string;
          epost: string;
          id?: string;
          navn: string;
          notater?: string | null;
          reservation_expires_at?: string | null;
          reservation_notified_at?: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          telefon: string;
          tour_id?: string | null;
          type?: Database["public"]["Enums"]["booking_type"];
          waitlist_promoted_at?: string | null;
        };
        Update: {
          belop?: number;
          betalt_belop?: number | null;
          created_at?: string;
          dato?: string;
          epost?: string;
          id?: string;
          navn?: string;
          notater?: string | null;
          reservation_expires_at?: string | null;
          reservation_notified_at?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          telefon?: string;
          tour_id?: string | null;
          type?: Database["public"]["Enums"]["booking_type"];
          waitlist_promoted_at?: string | null;
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
      news: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          published_at: string | null;
          short_description: string | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          published_at?: string | null;
          short_description?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          published_at?: string | null;
          short_description?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      participants: {
        Row: {
          booking_id: string;
          email: string;
          id: string;
          name: string;
          sos_navn: string;
          sos_telefon: string;
          telefon: string;
        };
        Insert: {
          booking_id: string;
          email: string;
          id?: string;
          name: string;
          sos_navn: string;
          sos_telefon: string;
          telefon: string;
        };
        Update: {
          booking_id?: string;
          email?: string;
          id?: string;
          name?: string;
          sos_navn?: string;
          sos_telefon?: string;
          telefon?: string;
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
          created_at: string;
          file_path: string;
          id: string;
          tour_id: string | null;
        };
        Insert: {
          created_at?: string;
          file_path: string;
          id?: string;
          tour_id?: string | null;
        };
        Update: {
          created_at?: string;
          file_path?: string;
          id?: string;
          tour_id?: string | null;
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
      subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          status: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          status?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          status?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      tours: {
        Row: {
          created_at: string;
          end_date: string;
          external_booking_url: string | null;
          hoydepunkter: string | null;
          id: string;
          image_url: string | null;
          long_description: string | null;
          price: number;
          seats_available: number;
          short_description: string | null;
          start_date: string;
          status: Database["public"]["Enums"]["tour_status"];
          sted: string | null;
          terreng: Database["public"]["Enums"]["terreng"] | null;
          title: string;
          total_seats: number;
          updated_at: string;
          vanskelighetsgrad:
            | Database["public"]["Enums"]["vanskelighetsgrad"]
            | null;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          external_booking_url?: string | null;
          hoydepunkter?: string | null;
          id?: string;
          image_url?: string | null;
          long_description?: string | null;
          price: number;
          seats_available?: number;
          short_description?: string | null;
          start_date: string;
          status?: Database["public"]["Enums"]["tour_status"];
          sted?: string | null;
          terreng?: Database["public"]["Enums"]["terreng"] | null;
          title: string;
          total_seats?: number;
          updated_at?: string;
          vanskelighetsgrad?:
            | Database["public"]["Enums"]["vanskelighetsgrad"]
            | null;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          external_booking_url?: string | null;
          hoydepunkter?: string | null;
          id?: string;
          image_url?: string | null;
          long_description?: string | null;
          price?: number;
          seats_available?: number;
          short_description?: string | null;
          start_date?: string;
          status?: Database["public"]["Enums"]["tour_status"];
          sted?: string | null;
          terreng?: Database["public"]["Enums"]["terreng"] | null;
          title?: string;
          total_seats?: number;
          updated_at?: string;
          vanskelighetsgrad?:
            | Database["public"]["Enums"]["vanskelighetsgrad"]
            | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_status:
        | "betalt"
        | "ikke_betalt"
        | "venteliste"
        | "kansellert"
        | "delvis_betalt";
      booking_type: "tur";
      terreng: "asfalt" | "grus" | "blandet";
      tour_status: "draft" | "published";
      vanskelighetsgrad: "nybegynner" | "intermedi├ªr" | "erfaren" | "ekspert";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
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
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
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
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
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
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
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
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "betalt",
        "ikke_betalt",
        "venteliste",
        "kansellert",
        "delvis_betalt",
      ],
      booking_type: ["tur"],
      terreng: ["asfalt", "grus", "blandet"],
      tour_status: ["draft", "published"],
      vanskelighetsgrad: ["nybegynner", "intermedi├ªr", "erfaren", "ekspert"],
    },
  },
} as const;
