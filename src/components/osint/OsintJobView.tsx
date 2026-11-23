import { CheckCircle2, Clock, Loader2, Search, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isJobActive, useOsintJob } from '@/hooks/useOsint';
import { apiErrorMessage, isNotFound } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { OsintResultView } from './OsintResultView';
import { JOB_STATUS_TEXT, kindLabel } from './osintMeta';
import type { OsintJobStatus, OsintKind } from '@/types';

export function JobStatusIcon({ status, className }: { status: OsintJobStatus; className?: string }) {
  const base = cn('h-4 w-4 shrink-0', className);
  if (status === 'running') return <Loader2 className={cn(base, 'animate-spin text-primary')} aria-label="rodando" />;
  if (status === 'pending') return <Clock className={cn(base, 'text-muted-foreground')} aria-label="na fila" />;
  if (status === 'error') return <XCircle className={cn(base, 'text-destructive')} aria-label="erro" />;
  return <CheckCircle2 className={cn(base, 'text-primary')} aria-label="pronto" />;
}

interface OsintJobCardProps {
  jobId: string | null;
  kinds?: OsintKind[];
  emptyText: string;
  className?: string;
}

/** Card com o andamento e o resultado de uma consulta. */
export function OsintJobCard({ jobId, kinds, emptyText, className }: OsintJobCardProps) {
  const job = useOsintJob(jobId);

  return (
    <Card className={cn('min-h-[320px] border-border/60 bg-card/60 backdrop-blur-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Search className="h-4 w-4 text-primary" />
          {job.data ? (
            <>
              {kindLabel(kinds, job.data.kind)}
              <span className="break-all font-mono text-sm font-normal text-muted-foreground">{job.data.value}</span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <JobStatusIcon status={job.data.status} className="h-3.5 w-3.5" />
                {JOB_STATUS_TEXT[job.data.status]}
              </span>
            </>
          ) : (
            'Resultado'
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!jobId ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : job.isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : job.isError ? (
          <p className="text-sm text-muted-foreground">
            {isNotFound(job.error)
              ? 'O resultado completo desta consulta não está mais na memória do ratosint (ele dormiu ou reiniciou). O que ela coletou continua gravado no banco dele; rode de novo para ver o detalhe.'
              : apiErrorMessage(job.error, 'Não consegui carregar a consulta.')}
          </p>
        ) : job.data && isJobActive(job.data.status) ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {job.data.status === 'pending' ? 'Na fila…' : 'Rodando… consultas com várias fontes podem levar alguns minutos.'}
            </p>
            <p className="text-xs">
              Deixe esta aba aberta: sem requisições por 15 min, o ratosint dorme e perde a consulta em andamento.
            </p>
          </div>
        ) : job.data?.status === 'error' ? (
          <p className="whitespace-pre-wrap text-sm text-destructive">{job.data.error || 'A consulta falhou.'}</p>
        ) : job.data?.result ? (
          <OsintResultView jobId={job.data.id} result={job.data.result} />
        ) : (
          <p className="text-sm text-muted-foreground">A consulta terminou sem resultado.</p>
        )}
      </CardContent>
    </Card>
  );
}
