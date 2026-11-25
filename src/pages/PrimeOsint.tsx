import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { FolderPlus, FolderSearch, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OsintPage } from '@/components/osint/OsintPage';
import { OsintQueryForm } from '@/components/osint/OsintQueryForm';
import { JobStatusIcon, OsintJobCard } from '@/components/osint/OsintJobView';
import { kindLabel } from '@/components/osint/osintMeta';
import { useOsintJobs, useOsintKinds } from '@/hooks/useOsint';
import { useCreateCase, useCsiCases } from '@/hooks/useCsi';
import { apiErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const ago = (iso: string) => formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR });

/** Aba "Investigações": pastas (casos) do usuário. */
function CaseList({ online }: { online: boolean }) {
  const navigate = useNavigate();
  const cases = useCsiCases(online);
  const createCase = useCreateCase();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const canSubmit = online && !!name.trim() && !createCase.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createCase.mutate(
      { name: name.trim(), description: description.trim() || null },
      {
        onSuccess: (created) => navigate(`/prime/csi/casos/${created.id}`),
        onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui criar a investigação.')),
      },
    );
  };

  const list = [...(cases.data ?? [])].sort((a, b) => Number(a.status === 'closed') - Number(b.status === 'closed'));

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nova investigação</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="case-name">Nome</Label>
              <Input
                id="case-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex.: golpe do site falso"
                maxLength={120}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-description">Descrição (opcional)</Label>
              <Input
                id="case-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="o que você quer descobrir"
                maxLength={2000}
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="gap-2" disabled={!canSubmit}>
              {createCase.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
              Criar
            </Button>
          </form>
        </CardContent>
      </Card>

      {!online ? (
        <p className="text-sm text-muted-foreground">aguardando o ratosint…</p>
      ) : cases.isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : cases.isError ? (
        <p className="text-sm text-destructive">{apiErrorMessage(cases.error, 'Não consegui carregar as investigações.')}</p>
      ) : !list.length ? (
        <p className="text-sm text-muted-foreground">Nenhuma investigação ainda. Crie a primeira acima.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <li key={c.id}>
              <Link to={`/prime/csi/casos/${c.id}`} className="group block h-full">
                <Card
                  className={cn(
                    'h-full border-border/60 bg-card/60 backdrop-blur-sm transition-colors group-hover:border-primary/50',
                    c.status === 'closed' && 'opacity-60',
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-start gap-2 text-base">
                      <FolderSearch className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 break-words">{c.name}</span>
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {c.status === 'closed' ? 'encerrado' : 'aberto'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 text-sm text-muted-foreground">
                    {c.description && <p className="line-clamp-2 break-words">{c.description}</p>}
                    <p className="text-xs">
                      {c.targets} {c.targets === 1 ? 'alvo' : 'alvos'} · atualizado {ago(c.updated_at)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Aba "Consulta avulsa": consulta fora de uma investigação. */
function QuickQuery({ online }: { online: boolean }) {
  const kinds = useOsintKinds(online);
  const jobs = useOsintJobs(online);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nova consulta</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <OsintQueryForm online={online} onCreated={(job) => setSelectedId(job.id)} />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Suas consultas recentes</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => jobs.refetch()}
              disabled={!online}
              aria-label="Atualizar consultas"
            >
              <RefreshCw className={cn('h-4 w-4', jobs.isFetching && 'animate-spin')} />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {!online ? (
              <p className="text-sm text-muted-foreground">aguardando o ratosint…</p>
            ) : jobs.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : jobs.isError ? (
              <p className="text-sm text-destructive">{apiErrorMessage(jobs.error, 'Não consegui carregar as consultas.')}</p>
            ) : !jobs.data?.length ? (
              <p className="text-sm text-muted-foreground">Nenhuma consulta desde que o ratosint acordou.</p>
            ) : (
              <ul className="space-y-0.5">
                {jobs.data.map((j) => (
                  <li key={j.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(j.id)}
                      className={cn(
                        '-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                        selectedId === j.id && 'bg-muted/40',
                      )}
                    >
                      <JobStatusIcon status={j.status} className="mt-0.5" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{j.value}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {kindLabel(kinds.data, j.kind)} · {ago(j.created_at)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">
              A lista fica na memória do ratosint e zera quando ele dorme. O que foi coletado continua no banco dele.
            </p>
          </CardContent>
        </Card>
      </div>

      <OsintJobCard
        jobId={selectedId}
        kinds={kinds.data}
        emptyText="Escolha o tipo, preencha o valor e clique em Consultar. O resultado aparece aqui."
      />
    </div>
  );
}

// Fase de teste: só admin. O controle de acesso fica no AdminRoute (App.tsx) e no back.
const PrimeOsint = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') === 'consulta' ? 'consulta' : 'casos';

  return (
    <OsintPage
      back={{ to: '/prime', label: 'prime' }}
      path={['prime', 'csi']}
      subtitle="investigações e consultas do ratosint · cada usuário vê só as suas · fase de teste (só admin)"
    >
      {(online) => (
        <Tabs value={tab} onValueChange={(v) => setParams(v === 'consulta' ? { aba: 'consulta' } : {}, { replace: true })}>
          <TabsList className="mb-6">
            <TabsTrigger value="casos">Investigações</TabsTrigger>
            <TabsTrigger value="consulta">Consulta avulsa</TabsTrigger>
          </TabsList>
          <TabsContent value="casos">
            <CaseList online={online} />
          </TabsContent>
          <TabsContent value="consulta">
            <QuickQuery online={online} />
          </TabsContent>
        </Tabs>
      )}
    </OsintPage>
  );
};

export default PrimeOsint;
