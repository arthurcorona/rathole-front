import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Radio,
  ExternalLink,
  Check,
  X,
  Star,
  RotateCcw,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRadarAdmin, useRadarPatch } from '@/hooks/useRadar';
import type { RadarAdminView, RadarItem, RadarPatch } from '@/types';

const PAGE_SIZE = 10;

const VIEWS: Record<RadarAdminView, { label: string; hint: string; empty: string }> = {
  radar: {
    label: 'No radar',
    hint: 'Publicados para os membros. Cada rodada diária publica sozinha os 10 de maior pontuação; destaque os melhores para o Dossiê.',
    empty: 'Nada publicado ainda. A próxima rodada diária publica os 10 itens de maior pontuação.',
  },
  highlights: {
    label: 'Destaques',
    hint: 'Dossiê da semana, público na home. A posição é opcional: sem ela, ordena por pontuação.',
    empty: 'Nenhum destaque. Use "Destacar" num item do radar para mandá-lo ao Dossiê da semana.',
  },
  queue: {
    label: 'Fila',
    hint: 'O que não entrou no automático. Publique ou destaque só se quiser.',
    empty: 'Fila limpa.',
  },
  rejected: {
    label: 'Descartados',
    hint: 'Itens tirados do radar ou descartados da fila.',
    empty: 'Nada descartado.',
  },
};

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

const actionBtn = 'h-10 sm:h-8 flex-1 sm:flex-none gap-1.5';
const dangerBtn = `${actionBtn} text-destructive hover:text-destructive hover:bg-destructive/10`;

function RadarAdminCard({ item, view }: { item: RadarItem; view: RadarAdminView }) {
  const patch = useRadarPatch();
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
  const spinner = <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <li className="p-4 space-y-3">
      {/* meta */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{item.source}</span>
        <span>·</span>
        <span>{format(new Date(when), 'dd/MM HH:mm', { locale: ptBR })}</span>
        {item.approved_at && (view === 'radar' || view === 'highlights') && (
          <>
            <span>·</span>
            <span>publicado {format(new Date(item.approved_at), 'dd/MM', { locale: ptBR })}</span>
          </>
        )}
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

      {item.summary && <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>}

      {item.hits && item.hits.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.hits.slice(0, 6).map((h) => (
            <span key={h} className="rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {h}
            </span>
          ))}
        </div>
      )}

      {/* ações por aba */}
      {view === 'radar' && (
        <div className="flex gap-2 pt-1 sm:justify-end">
          <Button size="sm" className={actionBtn} disabled={busy} onClick={() => run({ tier: 'public' }, 'Destacado no Dossiê')}>
            {busy ? spinner : <Star className="h-4 w-4" />}
            Destacar
          </Button>
          <Button size="sm" variant="outline" className={dangerBtn} disabled={busy} onClick={() => run({ status: 'rejected' }, 'Tirado do radar')}>
            <X className="h-4 w-4" />
            Tirar
          </Button>
        </div>
      )}

      {view === 'highlights' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
          <RankField item={item} saving={busy} onSave={(rank) => run({ rank }, 'Posição atualizada')} />
          <Button
            size="sm"
            variant="ghost"
            className="h-10 sm:h-8 text-xs sm:ml-auto"
            disabled={busy}
            onClick={() => run({ tier: 'members' }, 'Voltou só para o radar')}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            tirar dos destaques
          </Button>
        </div>
      )}

      {view === 'queue' && (
        <div className="flex flex-wrap gap-2 pt-1 sm:justify-end">
          <Button
            size="sm"
            className={actionBtn}
            disabled={busy}
            onClick={() => run({ status: 'approved', tier: 'members' }, 'Publicado no radar')}
          >
            {busy ? spinner : <Check className="h-4 w-4" />}
            Publicar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={actionBtn}
            disabled={busy}
            onClick={() => run({ status: 'approved', tier: 'public' }, 'Publicado e destacado')}
          >
            <Star className="h-4 w-4" />
            Destacar
          </Button>
          <Button size="sm" variant="outline" className={dangerBtn} disabled={busy} onClick={() => run({ status: 'rejected' }, 'Item descartado')}>
            <X className="h-4 w-4" />
            Descartar
          </Button>
        </div>
      )}

      {view === 'rejected' && (
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-10 sm:h-8 text-xs"
            disabled={busy}
            onClick={() => run({ status: 'pending' }, 'Voltou para a fila')}
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
  const [view, setView] = useState<RadarAdminView>('radar');
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, isFetching, refetch } = useRadarAdmin(view, page, PAGE_SIZE);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  // ao curar o último item da última página, volta para a página anterior
  useEffect(() => {
    if (data && page > totalPages) setPage(totalPages);
  }, [data, page, totalPages]);

  const goTo = (next: number) => {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mt-10 scroll-mt-20" ref={topRef}>
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Radar
          {total > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
              {total}
            </span>
          )}
          {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>
        <Tabs
          value={view}
          onValueChange={(v) => {
            setView(v as RadarAdminView);
            setPage(1);
          }}
        >
          <TabsList className="h-10 sm:h-9 w-full sm:w-auto">
            {(Object.keys(VIEWS) as RadarAdminView[]).map((v) => (
              <TabsTrigger key={v} value={v} className="flex-1 sm:flex-none text-xs">
                {VIEWS[v].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">{VIEWS[view].hint}</p>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando radar...</div>
        ) : isError ? (
          <div className="p-8 text-center text-muted-foreground space-y-3">
            <p>Não deu para carregar o radar.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              tentar de novo
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground max-w-sm">{VIEWS[view].empty}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {items.map((item) => (
              <RadarAdminCard key={item.id} item={item} view={view} />
            ))}
          </ul>
        )}

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="h-10 sm:h-8 gap-1"
              disabled={page <= 1 || isFetching}
              onClick={() => goTo(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums text-center">
              {first}–{last} de {total}
              <span className="hidden sm:inline"> · página {page} de {totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-10 sm:h-8 gap-1"
              disabled={page >= totalPages || isFetching}
              onClick={() => goTo(page + 1)}
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
