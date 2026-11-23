import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import { Braces, Download, FileDown, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { osintApi } from '@/lib/api';
import type { OsintResult } from '@/types';

// Exibição genérica do resultado de qualquer tipo de consulta do ratosint: objeto vira
// lista de campos, lista de objetos vira tabela, o resto cai no JSON. As telas
// específicas por tipo (perfil, rede, processos...) ficam para depois.

const MAX_ROWS = 100;
const MAX_COLS = 8;
const MAX_CHIPS = 50;
const MAX_DEPTH = 4;
const MAX_JSON_CHARS = 200_000;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isPrimitive = (v: unknown) =>
  v === null || v === undefined || ['string', 'number', 'boolean'].includes(typeof v);

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Primitive({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="text-muted-foreground">—</span>;
  if (typeof value === 'boolean') return <span>{value ? 'sim' : 'não'}</span>;
  const text = String(value);
  // só http(s) vira link: o dado vem de fontes externas
  if (/^https?:\/\/\S+$/i.test(text)) {
    return (
      <a href={text} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary hover:underline">
        {text}
      </a>
    );
  }
  return <span className="whitespace-pre-wrap break-words">{text}</span>;
}

function JsonBlock({ value }: { value: unknown }) {
  const json = JSON.stringify(value, null, 2) ?? 'null';
  return (
    <pre className="max-h-[32rem] overflow-auto rounded-md border border-code-border bg-code-bg p-3 text-xs leading-relaxed">
      {json.length > MAX_JSON_CHARS ? `${json.slice(0, MAX_JSON_CHARS)}\n… (cortado; baixe o JSON completo)` : json}
    </pre>
  );
}

function Cell({ value }: { value: unknown }) {
  if (isPrimitive(value)) return <Primitive value={value} />;
  if (Array.isArray(value)) {
    if (!value.every(isPrimitive)) return <span className="text-muted-foreground">[{value.length}]</span>;
    const shown = value.slice(0, 5).map(String).join(', ');
    return <span className="break-words">{value.length > 5 ? `${shown} +${value.length - 5}` : shown}</span>;
  }
  return <span className="text-muted-foreground">{'{…}'}</span>;
}

function ObjectTable({ rows }: { rows: Obj[] }) {
  const visible = rows.slice(0, MAX_ROWS);
  // colunas: chaves com valor simples, na ordem em que aparecem
  const cols: string[] = [];
  for (const row of visible) {
    for (const [k, v] of Object.entries(row)) {
      const simple = isPrimitive(v) || (Array.isArray(v) && v.every(isPrimitive));
      if (simple && !cols.includes(k)) cols.push(k);
    }
  }
  if (!cols.length) return <JsonBlock value={rows} />;
  const shownCols = cols.slice(0, MAX_COLS);

  return (
    <div className="space-y-1">
      <div className="overflow-x-auto rounded-md border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              {shownCols.map((c) => (
                <TableHead key={c} className="whitespace-nowrap font-mono text-xs">
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row, i) => (
              <TableRow key={i}>
                {shownCols.map((c) => (
                  <TableCell key={c} className="max-w-[24rem] align-top text-xs">
                    <Cell value={row[c]} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(rows.length > MAX_ROWS || cols.length > MAX_COLS) && (
        <p className="text-xs text-muted-foreground">
          mostrando {visible.length} de {rows.length} linhas e {shownCols.length} de {cols.length} colunas · o JSON completo
          tem tudo
        </p>
      )}
    </div>
  );
}

function DataView({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (isPrimitive(value)) return <Primitive value={value} />;
  if (depth >= MAX_DEPTH) return <JsonBlock value={value} />;

  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-muted-foreground">vazio</span>;
    if (value.every(isPrimitive)) {
      return (
        <ul className="flex flex-wrap gap-1.5">
          {value.slice(0, MAX_CHIPS).map((v, i) => (
            <li key={i} className="rounded border border-border/60 px-1.5 py-0.5 text-xs">
              <Primitive value={v} />
            </li>
          ))}
          {value.length > MAX_CHIPS && <li className="text-xs text-muted-foreground">+{value.length - MAX_CHIPS}</li>}
        </ul>
      );
    }
    if (value.every(isObj)) return <ObjectTable rows={value} />;
    return <JsonBlock value={value} />;
  }

  const entries = Object.entries(value as Obj);
  if (!entries.length) return <span className="text-muted-foreground">vazio</span>;
  return (
    <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(7rem,max-content)_minmax(0,1fr)]">
      {entries.map(([k, v]) => (
        <Fragment key={k}>
          <dt className="pt-0.5 font-mono text-xs text-muted-foreground">{k}</dt>
          <dd className="min-w-0 text-sm">
            {isPrimitive(v) ? (
              <Primitive value={v} />
            ) : (
              <details open={depth < 1}>
                <summary className="cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground">
                  {Array.isArray(v) ? `${v.length} itens` : `${Object.keys(v as Obj).length} campos`}
                </summary>
                <div className="mt-2 border-l border-border/60 pl-3">
                  <DataView value={v} depth={depth + 1} />
                </div>
              </details>
            )}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}

export function OsintResultView({ jobId, result }: { jobId: string; result: OsintResult }) {
  const [raw, setRaw] = useState(false);
  const files = result.files ?? [];
  const baseName = `${result.kind}-${result.query}`.replace(/[^\w.-]+/g, '_').slice(0, 80);

  const downloadJson = () =>
    saveBlob(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }), `${baseName}.json`);

  const downloadFile = async (path: string) => {
    try {
      saveBlob(await osintApi.file(jobId, path), path.split('/').pop() || 'arquivo');
    } catch {
      // o disco do ratosint no Render é apagado quando ele dorme ou é publicado de novo
      toast.error('Não consegui baixar o arquivo. Se o ratosint dormiu ou reiniciou, rode a consulta de novo.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={downloadJson}>
          <Download className="h-3.5 w-3.5" />
          JSON completo
        </Button>
        {files.map((f) => (
          <Button key={f} variant="outline" size="sm" className="gap-2" onClick={() => downloadFile(f)}>
            <FileDown className="h-3.5 w-3.5" />
            {f.split('/').pop()}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto gap-2" onClick={() => setRaw((r) => !r)}>
          {raw ? <LayoutList className="h-3.5 w-3.5" /> : <Braces className="h-3.5 w-3.5" />}
          {raw ? 'formatado' : 'JSON bruto'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">chamadas à API: {result.api_calls ?? 0}</p>

      {raw ? <JsonBlock value={result.data} /> : <DataView value={result.data} />}
    </div>
  );
}
