export type Subscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriberInsert = Omit<
  Subscriber,
  "id" | "subscribed_at" | "created_at" | "updated_at"
>;

export type SubscriberUpdate = Partial<
  Pick<Subscriber, "status" | "unsubscribed_at">
>;
