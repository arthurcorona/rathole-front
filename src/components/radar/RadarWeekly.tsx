import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Newspaper, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRadarWeekly } from '@/hooks/useRadar';

const COMPACT_LIMIT = 5;

interface RadarWeeklyProps {
  /** some do layout quando não há dossiê (default: true, para não deixar buraco na home) */
  hideWhenEmpty?: boolean;
  className?: string;
}

/** Card público do Dossiê semanal: ranking numerado pela posição definida na curadoria. */
export function RadarWeekly({ hideWhenEmpty = true, className }: RadarWeeklyProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useRadarWeekly();
  const items = data?.items ?? [];

  if (isError) return null;
  if (!isLoading && items.length === 0 && hideWhenEmpty) return null;

  const weekLabel = data?.week_start
    ? `semana de ${format(parseISO(data.week_start), "d 'de' MMMM", { locale: ptBR })}`
    : null;

  const visible = expanded ? items : items.slice(0, COMPACT_LIMIT);

  return (
    <Card className={`bg-card/60 backdrop-blur-sm border-border/60 ${className ?? ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Newspaper className="h-5 w-5 text-primary" />
          Dossiê da semana
        </CardTitle>
        {weekLabel && <p className="mt-1 text-xs text-muted-foreground">{weekLabel} · o que importou em segurança e privacidade</p>}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded bg-muted/40" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">O primeiro dossiê sai em breve.</p>
        ) : (
          <ol className="space-y-0.5">
            {visible.map((item, i) => (
              <li key={item.id}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -mx-2 flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/30"
                >
                  <span className="w-6 shrink-0 font-mono text-sm tabular-nums text-primary">
                    {String(item.rank ?? i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.source}</span>
                  </span>
                  <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ol>
        )}

        {items.length > COMPACT_LIMIT && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <>recolher <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>ver todos ({items.length}) <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
