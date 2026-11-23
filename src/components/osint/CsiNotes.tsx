import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddNote, useDeleteNote } from '@/hooks/useCsi';
import { apiErrorMessage } from '@/lib/apiError';
import { NOTE_KIND_LABEL } from './osintMeta';
import type { CsiNote, CsiNoteKind } from '@/types';

const isHttpUrl = (u: string | null): u is string => !!u && /^https?:\/\/\S+$/i.test(u);

interface CsiNotesProps {
  scope: 'case' | 'target';
  ownerId: number;
  notes: CsiNote[];
  title?: string;
}

/** Notas tipadas de um caso ou de um alvo: adicionar, listar e apagar. */
export function CsiNotes({ scope, ownerId, notes, title = 'Notas' }: CsiNotesProps) {
  const addNote = useAddNote();
  const deleteNote = useDeleteNote();
  const [kind, setKind] = useState<CsiNoteKind>('nota');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const needsUrl = kind === 'link';
  const canSubmit = !!text.trim() && (!needsUrl || isHttpUrl(url.trim())) && !addNote.isPending;
  const idPrefix = `note-${scope}-${ownerId}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addNote.mutate(
      { scope, id: ownerId, note: { kind, text: text.trim(), url: url.trim() || null } },
      {
        onSuccess: () => {
          setText('');
          setUrl('');
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui salvar a nota.')),
      },
    );
  };

  const remove = (note: CsiNote) => {
    if (!window.confirm('Apagar esta nota?')) return;
    deleteNote.mutate(note.id, {
      onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui apagar a nota.')),
    });
  };

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {title} <span className="text-sm font-normal text-muted-foreground">({notes.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <form onSubmit={submit} className="space-y-2">
          <div className="flex gap-2">
            <Select value={kind} onValueChange={(v) => setKind(v as CsiNoteKind)}>
              <SelectTrigger className="w-[130px] shrink-0" aria-label="Tipo da nota">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(NOTE_KIND_LABEL) as CsiNoteKind[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {NOTE_KIND_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {needsUrl && (
              <Input
                id={`${idPrefix}-url`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                aria-label="URL"
                maxLength={2000}
              />
            )}
          </div>
          <Textarea
            id={`${idPrefix}-text`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="observação, fato, hipótese…"
            aria-label="Texto da nota"
            rows={3}
            maxLength={10000}
          />
          <Button type="submit" size="sm" variant="outline" className="gap-2" disabled={!canSubmit}>
            {addNote.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Adicionar
          </Button>
        </form>

        {notes.length > 0 && (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="group rounded-md border border-border/60 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded border border-primary/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                    {NOTE_KIND_LABEL[n.kind as CsiNoteKind] ?? n.kind}
                  </span>
                  {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true, locale: ptBR })}
                  <button
                    type="button"
                    onClick={() => remove(n)}
                    className="ml-auto rounded p-1 opacity-60 transition-opacity hover:text-destructive hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Apagar nota"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {isHttpUrl(n.url) && (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mb-1 block break-all text-sm text-primary hover:underline"
                  >
                    {n.url}
                  </a>
                )}
                <p className="whitespace-pre-wrap break-words text-sm">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
