import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Building2, Loader2, Pencil, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OsintPage } from '@/components/osint/OsintPage';
import { OsintQueryForm } from '@/components/osint/OsintQueryForm';
import { JobStatusIcon, OsintJobCard } from '@/components/osint/OsintJobView';
import { CsiNotes } from '@/components/osint/CsiNotes';
import { TargetKindIcon } from '@/components/osint/TargetKindIcon';
import { JOB_STATUS_TEXT, TARGET_KIND_LABEL, kindLabel } from '@/components/osint/osintMeta';
import { useCsiCase, useCsiTarget, useCsiTimeline, useDeleteTarget, useUpdateTarget } from '@/hooks/useCsi';
import { useOsintKinds, useOsintStatus } from '@/hooks/useOsint';
import { apiErrorMessage, isNotFound } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import type { CsiTargetDetail, CsiTargetKind, OsintJobStatus, OsintKind } from '@/types';

const ago = (iso: string) => formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR });
const TIMELINE_LIMIT = 30;

/** Ajusta o texto que o ratosint manda: tira o id de quem criou (é sempre o dono) e traduz o status. */
function timelineText(tipo: string, texto: string): string {
  if (tipo === 'alvo') return 'alvo criado';
  return texto.replace(/— (pending|running|done|error)$/, (_, s: OsintJobStatus) => `— ${JOB_STATUS_TEXT[s]}`);
}

function TargetInfo({ data }: { data: CsiTargetDetail }) {
  const navigate = useNavigate();
  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const [kind, setKind] = useState<CsiTargetKind>(data.kind);
  const [summary, setSummary] = useState(data.summary ?? '');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateTarget.mutate(
      { id: data.id, name: name.trim(), kind, summary: summary.trim() || null },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui salvar.')),
      },
    );
  };

  const remove = () => {
    if (!window.confirm(`Apagar o alvo "${data.name}" com as notas dele? Não tem volta.`)) return;
    deleteTarget.mutate(data.id, {
      onSuccess: () => navigate(`/prime/osint/casos/${data.case_id}`, { replace: true }),
      onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui apagar.')),
    });
  };

  if (editing) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={save} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="target-edit-name">Nome</Label>
                <Input id="target-edit-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={160} />
              </div>
              <ToggleGroup
                type="single"
                value={kind}
                onValueChange={(v) => v && setKind(v as CsiTargetKind)}
                variant="outline"
                className="justify-start"
                aria-label="Tipo do alvo"
              >
                <ToggleGroupItem value="pessoa" className="gap-1.5" aria-label="pessoa">
                  <User className="h-3.5 w-3.5" />
                  pessoa
                </ToggleGroupItem>
                <ToggleGroupItem value="empresa" className="gap-1.5" aria-label="empresa">
                  <Building2 className="h-3.5 w-3.5" />
                  empresa
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-edit-summary">Resumo</Label>
              <Textarea
                id="target-edit-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="quem é, o que já se sabe"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!name.trim() || updateTarget.isPending}>
                Salvar
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
        <TargetKindIcon kind={data.kind} className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="whitespace-pre-wrap break-words text-sm">
            {data.summary || <span className="text-muted-foreground">Sem resumo. Use Editar para registrar o que já se sabe.</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {TARGET_KIND_LABEL[data.kind]} · criado {ago(data.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              setName(data.name);
              setKind(data.kind);
              setSummary(data.summary ?? '');
              setEditing(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={remove}
            disabled={deleteTarget.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Apagar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TargetJobs({
  data,
  kinds,
  selectedId,
  onSelect,
}: {
  data: CsiTargetDetail;
  kinds?: OsintKind[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Consultas do alvo <span className="text-sm font-normal text-muted-foreground">({data.jobs.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!data.jobs.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma consulta ainda.</p>
        ) : (
          <ul className="space-y-0.5">
            {data.jobs.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => onSelect(j.id)}
                  className={cn(
                    '-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    selectedId === j.id && 'bg-muted/40',
                  )}
                >
                  <JobStatusIcon status={j.status} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{j.value}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {kindLabel(kinds, j.kind)} · {ago(j.created_at)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TargetIdentities({ data }: { data: CsiTargetDetail }) {
  if (!data.identities.length) return null;
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Identidades vinculadas <span className="text-sm font-normal text-muted-foreground">({data.identities.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 text-sm">
          {data.identities.map((i) => (
            <li key={i.id} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-mono text-xs text-muted-foreground">{i.platform}</span>
              <span className="break-all">{i.display_name || i.handle || i.external_id}</span>
              <span className="text-xs text-muted-foreground">
                {[i.role, i.confidence].filter(Boolean).join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TargetTimeline({ targetId, online }: { targetId: number; online: boolean }) {
  const timeline = useCsiTimeline(targetId, online);
  const events = (timeline.data ?? []).slice(0, TIMELINE_LIMIT);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Linha do tempo</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {timeline.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : timeline.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(timeline.error, 'Não consegui carregar a linha do tempo.')}</p>
        ) : (
          <ol className="space-y-3 border-l border-border/60 pl-4">
            {events.map((ev, i) => (
              <li key={`${ev.at}-${i}`} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">{ev.tipo}</span>
                <span className="ml-2 text-xs text-muted-foreground">{ago(ev.at)}</span>
                <p className="break-words text-muted-foreground">{timelineText(ev.tipo, ev.texto)}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

const PrimeOsintTarget = () => {
  const id = Number(useParams().targetId);
  // mesma consulta de status que o OsintPage usa (o react-query compartilha o cache)
  const online = useOsintStatus().isSuccess;
  const target = useCsiTarget(id, online);
  const caseQ = useCsiCase(target.data?.case_id ?? 0, online && !!target.data);
  const kinds = useOsintKinds(online);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const caseName = caseQ.data?.name ?? 'caso';
  const back = target.data
    ? { to: `/prime/osint/casos/${target.data.case_id}`, label: caseName }
    : { to: '/prime/osint', label: 'investigações' };

  return (
    <OsintPage back={back} path={['prime', 'osint', caseName, target.data?.name ?? '…']}>
      {(isOnline) => {
        if (!isOnline) return <p className="text-sm text-muted-foreground">aguardando o ratosint…</p>;
        if (target.isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
        if (target.isError || !target.data) {
          return (
            <p className="text-sm text-muted-foreground">
              {isNotFound(target.error) ? 'Alvo não encontrado.' : apiErrorMessage(target.error, 'Não consegui carregar o alvo.')}{' '}
              <Link to="/prime/osint" className="text-primary hover:underline">
                voltar
              </Link>
            </p>
          );
        }
        const data = target.data;
        return (
          <div className="space-y-6">
            <TargetInfo key={data.updated_at ?? data.created_at} data={data} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
              <div className="min-w-0 space-y-6">
                <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Consultar a partir deste alvo</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <OsintQueryForm
                      online={isOnline}
                      targetId={data.id}
                      initialValue={data.name}
                      onCreated={(job) => setSelectedJob(job.id)}
                    />
                  </CardContent>
                </Card>
                <OsintJobCard
                  jobId={selectedJob}
                  kinds={kinds.data}
                  emptyText="Rode uma consulta acima ou abra uma da lista de consultas do alvo."
                />
              </div>

              <div className="min-w-0 space-y-6">
                <TargetJobs data={data} kinds={kinds.data} selectedId={selectedJob} onSelect={setSelectedJob} />
                <CsiNotes scope="target" ownerId={data.id} notes={data.notes} />
                <TargetIdentities data={data} />
                <TargetTimeline targetId={data.id} online={isOnline} />
              </div>
            </div>
          </div>
        );
      }}
    </OsintPage>
  );
};

export default PrimeOsintTarget;
