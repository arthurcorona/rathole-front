import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Radio,
  ExternalLink,
  Check,
  X,
  Crown,
  Globe,
  RotateCcw,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRadarAdmin, useRadarPatch } from '@/hooks/useRadar';
import type { RadarItem, RadarPatch, RadarStatus, RadarTier } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<RadarStatus, string> = {
  pending: 'Pendentes',
  approved: 'Aprovados',
  rejected: 'Descartados',
};

const TIER_LABEL: Record<RadarTier, string> = {
  members: 'Membros',
  public: 'Dossiê',
};

function TierPill({ tier }: { tier: RadarTier }) {
  return tier === 'members' ? (
    <Badge className="gap-1 bg-primary/15 text-primary hover:bg-primary/20 border-0 text-[11px]">
      <Crown className="h-3 w-3" /> Membros
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 text-[11px]">
      <Globe className="h-3 w-3" /> Dossiê
    </Badge>
  );
}

/** Escolha de destino (Membros = edição diária; Dossiê = ranking público da semana). */
function TierSwitch({
  value,
  onChange,
  disabled,
}: {
  value: RadarTier;
  onChange: (t: RadarTier) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
      {(['members', 'public'] as RadarTier[]).map((t) => (
        <button
          key={t}
          type="button"
          disabled={disabled}
          onClick={() => onChange(t)}
          className={cn(
            'px-3 h-10 sm:h-8 transition-colors',
            value === t ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted/40',
          )}
        >
          {TIER_LABEL[t]}
        </button>
      ))}
    </div>
  );
}

/** Campo de posição no dossiê: salva ao sair do campo ou no Enter. */
function RankField({
  item,
  onSave,
  saving,
}: {
  item: RadarItem;
  onSave: (rank: number | null) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(item.rank?.toString() ?? '');

  const commit = () => {
    const trimmed = value.trim();
    const next = trimmed === '' ? null : Number(trimmed);
    if (next !== null && (!Number.isInteger(next) || next < 1)) {
      toast.error('Posição precisa ser um inteiro a partir de 1');
      setValue(item.rank?.toString() ?? '');
      return;
    }
    if (next === (item.rank ?? null)) return;
    onSave(next);
  };

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      posição
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        disabled={saving}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        placeholder="—"
        className="h-10 sm:h-8 w-16 rounded-md border border-input bg-background px-2 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </label>
  );
}

function RadarAdminCard({ item }: { item: RadarItem }) {
  const patch = useRadarPatch();
  const [tier, setTier] = useState<RadarTier>(item.tier);
  const busy = patch.isPending && patch.variables?.id === item.id;

  const run = (body: RadarPatch, ok: string) =>
    patch.mutate(
      { id: item.id, ...body },
      {
        onSuccess: () => toast.success(ok),
        onError: () => toast.error('Não foi possível atualizar o item'),
      },
    );

  const when = item.published_at ?? item.created_at;

  return (
    <li className="p-4 space-y-3">
      {/* meta */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{item.source}</span>
        <span>·</span>
        <span>{item.run_type === 'daily' ? 'rodada diária' : 'rodada semanal'}</span>
        <span>·</span>
        <span>{format(new Date(when), "dd/MM HH:mm", { locale: ptBR })}</span>
        <Badge variant="outline" className="ml-auto font-mono text-[11px] tabular-nums">
          {item.score} pts
        </Badge>
      </div>

      {/* título com link externo */}
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2 font-medium leading-snug hover:text-primary transition-colors"
      >
        <span className="flex-1">{item.title}</span>
        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
      </a>

      {item.summary && (
        <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
      )}

      {item.hits && item.hits.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.hits.slice(0, 6).map((h) => (
            <span key={h} className="rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {h}
            </span>
          ))}
        </div>
      )}

      {/* ações */}
      {item.status === 'pending' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
          <TierSwitch value={tier} onChange={setTier} disabled={busy} />
          <div className="flex gap-2 sm:ml-auto">
            <Button
              size="sm"
              className="h-10 sm:h-8 flex-1 sm:flex-none gap-1.5"
              disabled={busy}
              onClick={() => run({ status: 'approved', tier }, `Aprovado para ${TIER_LABEL[tier]}`)}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10 sm:h-8 flex-1 sm:flex-none gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={busy}
              onClick={() => run({ status: 'rejected' }, 'Item descartado')}
            >
              <X className="h-4 w-4" />
              Descartar
            </Button>
          </div>
        </div>
      )}

      {item.status === 'approved' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
          <div className="flex items-center gap-2">
            <TierPill tier={item.tier} />
            {item.approved_at && (
              <span className="text-xs text-muted-foreground">
                em {format(new Date(item.approved_at), "dd/MM", { locale: ptBR })}
              </span>
            )}
          </div>
          {item.tier === 'public' && (
            <RankField item={item} saving={busy} onSave={(rank) => run({ rank }, 'Posição atualizada')} />
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="h-10 sm:h-8 text-xs"
              disabled={busy}
              onClick={() =>
                run(
                  { tier: item.tier === 'public' ? 'members' : 'public' },
                  `Movido para ${item.tier === 'public' ? 'Membros' : 'Dossiê'}`,
                )
              }
            >
              mover p/ {item.tier === 'public' ? 'Membros' : 'Dossiê'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-10 sm:h-8 text-xs text-muted-foreground"
              disabled={busy}
              onClick={() => run({ status: 'pending' }, 'Voltou para pendentes')}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              pendente
            </Button>
          </div>
        </div>
      )}

      {item.status === 'rejected' && (
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-10 sm:h-8 text-xs"
            disabled={busy}
            onClick={() => run({ status: 'pending' }, 'Item restaurado')}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            restaurar
          </Button>
        </div>
      )}
    </li>
  );
}

/** Seção de curadoria do Radar no painel admin. Pensada para uso no celular. */
export function RadarAdmin() {
  const [status, setStatus] = useState<RadarStatus>('pending');
  const { data, isLoading, isError, refetch } = useRadarAdmin(status);
  const items = data ?? [];

  return (
    <div className="mt-10">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Radar
          {status === 'pending' && items.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              {items.length}
            </span>
          )}
        </h2>
        <Tabs value={status} onValueChange={(v) => setStatus(v as RadarStatus)}>
          <TabsList className="h-10 sm:h-9 w-full sm:w-auto">
            {(Object.keys(STATUS_LABEL) as RadarStatus[]).map((s) => (
              <TabsTrigger key={s} value={s} className="flex-1 sm:flex-none text-xs">
                {STATUS_LABEL[s]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando radar...</div>
        ) : isError ? (
          <div className="p-8 text-center text-muted-foreground space-y-3">
            <p>Não deu para carregar o radar.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>tentar de novo</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">
              {status === 'pending' ? 'Fila limpa' : `Nenhum item em ${STATUS_LABEL[status].toLowerCase()}`}
            </h3>
            {status === 'pending' && (
              <p className="text-muted-foreground mt-1 text-sm">Nada aguardando curadoria. O radar envia novos itens a cada rodada.</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {items.map((item) => (
              <RadarAdminCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
