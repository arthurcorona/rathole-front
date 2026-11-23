import { Building2, User } from 'lucide-react';
import type { CsiTargetKind } from '@/types';

export function TargetKindIcon({ kind, className }: { kind: CsiTargetKind; className?: string }) {
  return kind === 'empresa' ? <Building2 className={className} /> : <User className={className} />;
}
