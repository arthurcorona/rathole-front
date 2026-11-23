import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateOsintJob, useOsintKinds } from '@/hooks/useOsint';
import { apiErrorMessage } from '@/lib/apiError';
import { OSINT_HINTS, OSINT_PLACEHOLDER, OSINT_VALUE_LABEL, groupKinds } from './osintMeta';
import type { OsintJob } from '@/types';

interface OsintQueryFormProps {
  online: boolean;
  /** liga a consulta a um alvo do CSI */
  targetId?: number;
  /** valor inicial do campo (ex.: o nome do alvo) */
  initialValue?: string;
  onCreated: (job: OsintJob) => void;
}

/** Escolha do tipo de consulta + valor. Dispara um job no ratosint. */
export function OsintQueryForm({ online, targetId, initialValue = '', onCreated }: OsintQueryFormProps) {
  const kinds = useOsintKinds(online);
  const createJob = useCreateOsintJob();
  const [kind, setKind] = useState('');
  const [value, setValue] = useState(initialValue);

  const groups = useMemo(() => groupKinds(kinds.data ?? []), [kinds.data]);
  const spec = kinds.data?.find((k) => k.kind === kind);
  const canSubmit = online && !!kind && !!value.trim() && !createJob.isPending;
  const idPrefix = targetId ? `osint-t${targetId}` : 'osint';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createJob.mutate(
      { kind, value: value.trim(), ...(targetId ? { target_id: targetId } : {}) },
      {
        onSuccess: onCreated,
        onError: (err) => toast.error(apiErrorMessage(err, 'Não consegui disparar a consulta.')),
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-kind`}>Tipo de consulta</Label>
        <Select value={kind} onValueChange={setKind} disabled={!kinds.data}>
          <SelectTrigger id={`${idPrefix}-kind`}>
            <SelectValue placeholder={kinds.isLoading ? 'carregando…' : 'escolha'} />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectGroup key={g.group}>
                <SelectLabel>{g.group}</SelectLabel>
                {g.kinds.map((k) => (
                  <SelectItem key={k.kind} value={k.kind}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        {kind && OSINT_HINTS[kind] && <p className="text-xs leading-relaxed text-muted-foreground">{OSINT_HINTS[kind]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-value`}>{(spec && OSINT_VALUE_LABEL[spec.value]) || 'Valor'}</Label>
        <Input
          id={`${idPrefix}-value`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={(spec && OSINT_PLACEHOLDER[spec.value]) || ''}
          maxLength={200}
          autoComplete="off"
        />
      </div>

      <Button type="submit" className="w-full gap-2" disabled={!canSubmit}>
        {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Consultar
      </Button>
    </form>
  );
}
