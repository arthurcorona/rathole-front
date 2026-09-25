export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'reader';
  member_until?: string | null;
  created_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status: 'draft' | 'published';
  visibility: 'public' | 'members';
  created_at: string;
  updated_at: string;
  author_id: string;
  upvotes_count?: number;
  has_voted?: boolean;
  //join
  author: User;
  tags: Tag[];
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  // comment pode ser de user logado OU anônimo
  user_id?: string | null;
  user?: User;
  guest_name?: string;
  parent_id?: string | null; //threads
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'reviewed' | 'completed';
  upvotes_count: number;
  created_at: string;
  user_id?: string;
  user: User;
}
// ---- Radar (notícias curadas) ----
export type RadarRunType = 'daily' | 'weekly';
export type RadarTier = 'members' | 'public';
export type RadarStatus = 'pending' | 'approved' | 'rejected';

export interface RadarItem {
  id: string;
  title: string;
  link: string;
  source: string;
  summary?: string | null;
  score: number;
  hits?: string[] | null;
  published_at?: string | null;
  run_type: RadarRunType;
  tier: RadarTier;
  status: RadarStatus;
  rank?: number | null;
  approved_at?: string | null;
  created_at: string;
}

export interface RadarPatch {
  status?: RadarStatus;
  tier?: RadarTier;
  rank?: number | null;
}

export interface RadarDailyResponse {
  date: string | null;   // YYYY-MM-DD (null quando ?days= foi usado)
  days: number | null;
  items: RadarItem[];
}

export interface RadarWeeklyResponse {
  week_start: string | null; // YYYY-MM-DD (segunda-feira da semana do dossiê)
  items: RadarItem[];
}
