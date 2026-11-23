import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Archive, ArchiveRestore, Building2, Loader2, Pencil, Plus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OsintPage } from '@/components/osint/OsintPage';
import { CsiNotes } from '@/components/osint/CsiNotes';
import { TargetKindIcon } from '@/components/osint/TargetKindIcon';
import { TARGET_KIND_LABEL } from '@/components/osint/osintMeta';
import { useCreateTarget, useCsiCase, useDeleteCase, useUpdateCase } from '@/hooks/useCsi';
import { useOsintStatus } from '@/hooks/useOsint';
import { apiErrorMessage, isNotFound } from '@/lib/apiError';
import type { CsiCaseDetail, CsiTargetKind } from '@/types';

function CaseInfo({ data }: { data: CsiCaseDetail }) {
  const navigate = useNavigate();
  const updateCase = useUpdateCase();
  const deleteCase = useDeleteCase();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description ?? '');
  const closed = data.status === 'closed';

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateCase.mutate(
      { id: data.id, name: name.trim(), description: description.trim() || null },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui salvar.')),
      },
    );
  };

  const toggleStatus = () =>
    updateCase.mutate(
      { id: data.id, name: data.name, description: data.description, status: closed ? 'open' : 'closed' },
      { onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui mudar o status.')) },
    );

  const remove = () => {
    if (!window.confirm(`Apagar a investigação "${data.name}" com todos os alvos e notas? Não tem volta.`)) return;
    deleteCase.mutate(data.id, {
      onSuccess: () => navigate('/prime/osint', { replace: true }),
      onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui apagar.')),
    });
  };

  if (editing) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="case-edit-name">Nome</Label>
              <Input id="case-edit-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-edit-description">Descrição</Label>
              <Textarea
                id="case-edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!name.trim() || updateCase.isPending}>
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
        <div className="min-w-0 flex-1 space-y-1">
          <p className="whitespace-pre-wrap break-words text-sm">
            {data.description || <span className="text-muted-foreground">Sem descrição.</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {closed ? 'encerrada' : 'aberta'} · criada {formatDistanceToNow(parseISO(data.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              setName(data.name);
              setDescription(data.description ?? '');
              setEditing(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={toggleStatus} disabled={updateCase.isPending}>
            {closed ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {closed ? 'Reabrir' : 'Encerrar'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={remove}
            disabled={deleteCase.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Apagar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Targets({ data }: { data: CsiCaseDetail }) {
  const createTarget = useCreateTarget();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CsiTargetKind>('pessoa');
  const canSubmit = !!name.trim() && !createTarget.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createTarget.mutate(
      { caseId: data.id, name: name.trim(), kind },
      {
        onSuccess: () => setName(''),
        onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui adicionar o alvo.')),
      },
    );
  };

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Alvos <span className="text-sm font-normal text-muted-foreground">({data.targets.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
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
          <Input
            id="target-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === 'empresa' ? 'nome da empresa' : 'nome da pessoa'}
            aria-label="Nome do alvo"
            maxLength={160}
            autoComplete="off"
          />
          <Button type="submit" className="shrink-0 gap-2" disabled={!canSubmit}>
            {createTarget.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </Button>
        </form>

        {!data.targets.length ? (
          <p className="text-sm text-muted-foreground">
            Nenhum alvo ainda. Adicione as pessoas e empresas desta investigação.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.targets.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/prime/osint/alvos/${t.id}`}
                  className="group flex h-full items-start gap-3 rounded-md border border-border/60 p-3 transition-colors hover:border-primary/50"
                >
                  <TargetKindIcon kind={t.kind} className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-medium">{t.name}</span>
                    {t.summary && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{t.summary}</span>}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {TARGET_KIND_LABEL[t.kind]} · {t.counts.jobs} consultas · {t.counts.notes} notas
                      {t.counts.identities ? ` · ${t.counts.identities} identidades` : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const PrimeOsintCase = () => {
  const id = Number(useParams().caseId);
  // mesma consulta de status que o OsintPage usa (o react-query compartilha o cache)
  const online = useOsintStatus().isSuccess;
  const caseQ = useCsiCase(id, online);
  const name = caseQ.data?.name ?? '…';

  return (
    <OsintPage back={{ to: '/prime/osint', label: 'investigações' }} path={['prime', 'osint', name]}>
      {(isOnline) => {
        if (!isOnline) return <p className="text-sm text-muted-foreground">aguardando o ratosint…</p>;
        if (caseQ.isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
        if (caseQ.isError || !caseQ.data) {
          return (
            <p className="text-sm text-muted-foreground">
              {isNotFound(caseQ.error)
                ? 'Investigação não encontrada.'
                : apiErrorMessage(caseQ.error, 'Não consegui carregar a investigação.')}{' '}
              <Link to="/prime/osint" className="text-primary hover:underline">
                voltar
              </Link>
            </p>
          );
        }
        return (
          <div className="space-y-6">
            <CaseInfo key={caseQ.data.updated_at} data={caseQ.data} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
              <Targets data={caseQ.data} />
              <CsiNotes scope="case" ownerId={caseQ.data.id} notes={caseQ.data.notes} title="Notas do caso" />
            </div>
          </div>
        );
      }}
    </OsintPage>
  );
};

export default PrimeOsintCase;
