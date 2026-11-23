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

// ---- OSINT (o back repassa /osint/* para a API do ratosint) ----
export interface OsintKind {
  kind: string;      // ex.: "cnpj", "instagram.profile"
  label: string;     // ex.: "Empresa · CNPJ"
  value: string;     // tipo do valor pedido: nome, url, username, numero...
  sync: boolean;     // true = consulta rápida
}

export type OsintJobStatus = 'pending' | 'running' | 'done' | 'error';

export interface OsintResult {
  kind: string;
  query: string;
  data: unknown;
  files?: string[];        // caminhos para GET /osint/files/<caminho>
  api_calls?: number | null;
  [extra: string]: unknown;
}

export interface OsintJob {
  id: string;
  kind: string;
  value: string;
  opts: Record<string, unknown>;
  requested_by: string;
  target_id: number | null;
  status: OsintJobStatus;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error: string | null;
  api_calls: number | null;
  result?: OsintResult | null;  // só em GET /osint/jobs/:id
}

export interface OsintStatus {
  ok: boolean;
  db: unknown;
  auth: boolean;
  providers: string[];
  [extra: string]: unknown;
}

// ---- CSI: investigações (casos) com alvos, no ratosint ----
export type CsiTargetKind = 'pessoa' | 'empresa';
export type CsiCaseStatus = 'open' | 'closed';
export type CsiNoteKind = 'nota' | 'fato' | 'link' | 'telefone' | 'email' | 'endereco';

export interface CsiCaseSummary {
  id: number;
  name: string;
  description: string | null;
  status: string;
  targets: number;
  created_at: string;
  updated_at: string;
}

export interface CsiNote {
  id: number;
  kind: string;
  text: string;
  url: string | null;
  title: string | null;
  author: string;
  target_id: number | null;
  identity_id: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface CsiNoteInput {
  text: string;
  kind: CsiNoteKind;
  url?: string | null;
}

export interface CsiIdentity {
  id: number;
  platform: string;
  handle: string | null;
  display_name: string | null;
  external_id: string | null;
  url: string | null;
  role: string | null;
  confidence: string;
  added_at: string;
}

export interface CsiTarget {
  id: number;
  case_id: number;
  name: string;
  kind: CsiTargetKind;
  summary: string | null;
  created_by: string;
  created_at: string;
  updated_at: string | null;
  identities: CsiIdentity[];
  counts: { identities: number; notes: number; attachments: number; jobs: number; watches: number };
}

/** Consulta ligada ao alvo, como gravada no banco do ratosint (sem o resultado completo). */
export interface CsiTargetJob {
  id: string;
  kind: string;
  value: string | null;
  status: OsintJobStatus;
  created_at: string;
  finished_at: string | null;
  api_calls: number | null;
}

export interface CsiSnapshot {
  id: number;
  kind: string;
  source: string;
  collected_at: string;
  identity_id: number;
}

export interface CsiTargetDetail extends CsiTarget {
  notes: CsiNote[];
  jobs: CsiTargetJob[];
  snapshots: CsiSnapshot[];
}

export interface CsiCaseDetail {
  id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  targets: CsiTarget[];
  notes: CsiNote[];
}

export interface CsiTimelineEvent {
  at: string;
  tipo: string;
  texto: string;
  url?: string | null;
  job_id?: string;
}
