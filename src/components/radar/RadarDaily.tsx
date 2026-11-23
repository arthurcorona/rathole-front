import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Radio, ChevronRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRadarDaily } from '@/hooks/useRadar';
import { RadarItemDialog } from './RadarItemDialog';
import type { RadarItem } from '@/types';

const COMPACT_LIMIT = 6;

function RadarLine({
  item,
  showDate,
  onOpen,
}: {
  item: RadarItem;
  showDate?: boolean;
  onOpen: (item: RadarItem) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="group -mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-snug group-hover:text-primary transition-colors">
            {item.title}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {item.source}
            {showDate && item.approved_at && (
              <> · {format(new Date(item.approved_at), 'dd/MM', { locale: ptBR })}</>
            )}
          </span>
        </span>
        <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </li>
  );
}

/** Card compacto da edição diária (membros). "ver todos" abre os últimos 7 dias. */
export function RadarDaily() {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<RadarItem | null>(null);
  const today = useRadarDaily({});
  const week = useRadarDaily({ days: 7 }, expanded);

  const source = expanded ? week : today;
  const items = source.data?.items ?? [];
  const dateLabel = today.data?.date
    ? format(parseISO(today.data.date), "EEEE, d 'de' MMMM", { locale: ptBR })
    : null;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radio className="h-5 w-5 text-primary" />
              {expanded ? 'Radar · últimos 7 dias' : 'Radar de hoje'}
            </CardTitle>
            {dateLabel && !expanded && (
              <p className="mt-1 text-xs text-muted-foreground capitalize">{dateLabel}</p>
            )}
          </div>
          {source.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {source.isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded bg-muted/40" />)}
          </div>
        ) : source.isError ? (
          <p className="text-sm text-muted-foreground">Não deu para carregar o radar agora.</p>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
            {expanded
              ? 'Nenhuma notícia aprovada nos últimos 7 dias.'
              : 'A edição de hoje ainda está sendo curada. Volte mais tarde ou veja os últimos dias.'}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {(expanded ? items : items.slice(0, COMPACT_LIMIT)).map((item) => (
              <RadarLine key={item.id} item={item} showDate={expanded} onOpen={setSelected} />
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between">
          {!expanded && items.length > COMPACT_LIMIT && (
            <span className="text-xs text-muted-foreground">+{items.length - COMPACT_LIMIT} hoje</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 gap-1 text-xs text-primary hover:bg-primary/10"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>só hoje <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>ver todos <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>
      </CardContent>

      <RadarItemDialog item={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
