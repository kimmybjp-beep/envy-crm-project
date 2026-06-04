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
  distributor_name: string;
  quantity: number;
  created_at: string;
};

export type QrCodeRecord = {
  id: string;
  batch_id: string;
  distributor_name: string;
  code: string;
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
