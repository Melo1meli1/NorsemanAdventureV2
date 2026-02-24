/** Matches the `news` table in Supabase. */
export type News = {
  id: string;
  title: string;
  short_description: string | null;
  content: string | null;
  image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsInsert = Omit<News, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NewsUpdate = Partial<Omit<News, "id" | "created_at">> & {
  updated_at?: string;
};
