import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RadarItem } from '@/types';

interface RadarItemDialogProps {
  item: RadarItem | null;
  onClose: () => void;
}

function hostOf(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
}

/** Resumo de uma notícia do radar, com o link para a fonte. Usado pelo Radar diário e pelo Dossiê. */
export function RadarItemDialog({ item, onClose }: RadarItemDialogProps) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      {item && (
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-lg border-border/70 bg-card p-0 gap-0 overflow-hidden">
          {/* barra estilo terminal, no padrão do site */}
          <div className="flex items-center gap-2 border-b border-code-border bg-muted/10 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
              radar · {hostOf(item.link)}
            </span>
          </div>

          <div className="space-y-4 p-5">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Newspaper className="h-3 w-3" />
                  {item.source}
                </Badge>
                {item.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.published_at), "d 'de' MMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </span>
                )}
                {item.rank != null && (
                  <span className="ml-auto font-mono text-primary">#{item.rank} do dossiê</span>
                )}
              </div>
              <DialogTitle className="text-lg font-semibold leading-snug">{item.title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {item.summary?.trim() || 'A fonte não forneceu resumo. Leia a notícia completa no link abaixo.'}
              </DialogDescription>
            </DialogHeader>

            {item.hits && item.hits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.hits.map((h) => (
                  <span
                    key={h}
                    className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary"
                  >
                    #{h}
                  </span>
                ))}
              </div>
            )}

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="truncate text-xs text-muted-foreground">
                fonte: <span className="font-mono">{hostOf(item.link)}</span>
              </span>
              <Button asChild className="gap-2">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  Ler na fonte
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
