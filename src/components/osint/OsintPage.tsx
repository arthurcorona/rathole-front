import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useOsintStatus } from '@/hooks/useOsint';
import { apiErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

function ServiceStatus({ status }: { status: ReturnType<typeof useOsintStatus> }) {
  if (status.isLoading) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        acordando o ratosint (até 1 min)…
      </span>
    );
  }
  if (status.isError) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2 text-xs text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" />
        {apiErrorMessage(status.error, 'ratosint indisponível')}
        <Button size="sm" variant="outline" className="h-7" onClick={() => status.refetch()}>
          tentar de novo
        </Button>
      </span>
    );
  }
  const db = status.data?.db;
  const dbProblem = db === null ? 'sem banco' : typeof db === 'object' && db && 'error' in db ? 'erro no banco' : null;
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className={cn('h-2 w-2 rounded-full', dbProblem ? 'bg-yellow-500' : 'bg-green-500')} />
      ratosint online{dbProblem ? ` · ${dbProblem}` : ''}
    </span>
  );
}

interface OsintPageProps {
  back: { to: string; label: string };
  /** caminho no estilo terminal, ex.: ["prime", "osint"] -> ~/prime/osint */
  path: string[];
  subtitle?: React.ReactNode;
  /** recebe `online`: só dispare chamadas ao ratosint depois que ele respondeu */
  children: (online: boolean) => React.ReactNode;
}

/** Moldura das telas do OSINT: voltar, título em estilo terminal e status do ratosint. */
export function OsintPage({ back, path, subtitle, children }: OsintPageProps) {
  const status = useOsintStatus();
  const head = path.slice(0, -1);
  const last = path[path.length - 1];

  return (
    <Layout>
      <section className="container py-10 md:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              to={back.to}
              className="mb-2 inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {back.label}
            </Link>
            <h1 className="break-words text-2xl font-bold">
              <span className="text-muted-foreground">~/{head.map((p) => `${p}/`).join('')}</span>
              {last}
            </h1>
            {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
          </div>
          <ServiceStatus status={status} />
        </div>

        {children(status.isSuccess)}
      </section>
    </Layout>
  );
}
