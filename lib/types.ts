export type StoreTier = "UNASSIGNED" | "DISTRIBUTOR" | "TIER2" | "TIER3";

export type StoreStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export type Store = {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  password_hash?: string | null;
  password_salt?: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  status: StoreStatus;
  tier: StoreTier;
  tier_locked: boolean;
  points: number;
  created_at: string;
};

export type Scan = {
  id: string;
  scanned_code: string;
  store_id: string | null;
  tier_level: StoreTier;
  scanned_at: string;
};

export type ScanAlert = {
  id: string;
  store_id: string | null;
  existing_store_id: string | null;
  scanned_code: string;
  attempted_tier: StoreTier | null;
  alert_type: string;
  severity: string;
  message: string;
  status: "OPEN" | "REVIEWING" | "RESOLVED" | string;
  created_at: string;
  resolved_at: string | null;
};

export type AdminMessage = {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
};

export type QrBatch = {
  id: string;
  batch_name: string | null;
  distributor_id: string | null;
  distributor_name: string;
  apple_size: string | null;
  sticker_color: string | null;
  sticker_color_name: string | null;
  point_value: number | null;
  campaign_name: string | null;
  quantity: number;
  generated_at: string | null;
  generated_by: string | null;
  status: string | null;
  created_at: string;
};

export type QrCodeRecord = {
  id: string;
  batch_id: string;
  qr_code: string | null;
  human_readable_code: string | null;
  distributor_id: string | null;
  distributor_name: string;
  apple_size: string | null;
  sticker_color: string | null;
  sticker_color_name: string | null;
  point_value: number | null;
  campaign_name: string | null;
  code: string;
  status: string | null;
  claimed_by_outlet_id: string | null;
  claimed_at: string | null;
  created_at: string;
};

export type Reward = {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  stock: number;
  is_active: boolean;
  created_at: string;
};

export type RewardRedemption = {
  id: string;
  reward_id: string;
  store_id: string;
  points_spent: number;
  status: string;
  created_at: string;
};
