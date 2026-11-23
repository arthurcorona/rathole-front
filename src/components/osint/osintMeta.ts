import type { CsiNoteKind, CsiTargetKind, OsintJobStatus, OsintKind } from '@/types';

// Textos de apoio por tipo de consulta, trazidos da interface do ratosint
// (igosint/api/static/app.js). Dizem o que cada fonte devolve e o que gasta crédito.
export const OSINT_HINTS: Record<string, string> = {
  site: 'Grátis. WHOIS/RDAP do domínio (no .br vem CNPJ/CPF e representante legal), empresa do registrante, portas/CVEs dos IPs, busca web e o dossiê de quem responde pelo site.',
  tse: 'Grátis. Candidaturas nos dados abertos do TSE carregados no banco: cargo, partido, resultado, nascimento, ocupação, e-mail de campanha, CPF mascarado.',
  telefone: 'Validade, tipo, DDD/região e operadora original (offline). Quem usa: cruzamento com CNPJs, WHOIS, documentos e diários já coletados, mais busca web pelos formatos do número. Não existe base legal que devolva o dono.',
  diarios: 'Grátis. Diários oficiais municipais em texto completo (Querido Diário): nomeações, exonerações, concursos, licitações, multas. O serviço cai com frequência.',
  busca: 'Dorks (aspas, site:, filetype:) agrupados por categoria. Google CSE (100/dia), Serper (Google completo) ou Bing, conforme as chaves configuradas.',
  dossie: 'Busca geral por nome: empresas ligadas, processos com detalhes, busca web e contas no Instagram (até 5 créditos). Cada fonte é independente: se uma falhar, as outras aparecem.',
  'instagram.profile': '1 crédito HikerAPI (0 se em cache). Baixa a foto de perfil e grava no banco.',
  'instagram.medias': '1 crédito por página (padrão: 2 páginas). Data, local, marcados, coautores, menções.',
  'instagram.network': 'Caro: 1 crédito por página (padrão: 4 de seguidores + 4 de seguindo). A ordem da HikerAPI é relevância, não data.',
  'instagram.interactions': 'Lê comentários e marcações; devolve as contas recorrentes com pontuação. Gasta crédito.',
  'instagram.pivot': 'Links da bio, agregadores, vínculos Meta e mesmo username em 18 plataformas. Gasta crédito.',
  cnpj: 'Grátis. Cadastro, endereço, contato e quadro societário. Sócios entram no grafo.',
  processos: 'Grátis (DJEN/CNJ). Busca por NOME de parte; pega homônimos. Cobertura completa desde 2025.',
  processo: 'Grátis (DataJud + DJEN). Número CNJ com ou sem pontuação.',
  username: 'Grátis, mas pesado: testa o username em ~480 sites (Sherlock). Evite no Render: o volume de tráfego de saída pode suspender o serviço.',
  dominio: 'DNS, subdomínios pelo crt.sh, e-mails públicos (Hunter.io, gasta cota) e portas/CVEs dos IPs (InternetDB).',
  email: 'Grátis: Gravatar, GitHub, provedor/domínio, quem já usou o e-mail no grafo e onde aparece na web (2 consultas de busca).',
  github: 'Grátis. Perfil, repositórios, organizações e os e-mails/nomes presentes nos commits públicos.',
  aleph: 'OCCRP Aleph: registros societários, sanções e vazamentos. Exige chave paga (ALEPH_API_KEY).',
};

export const OSINT_VALUE_LABEL: Record<string, string> = {
  login: 'Login GitHub',
  username: 'Username',
  numero: 'Número',
  nome: 'Nome',
  dominio: 'Domínio',
  email: 'E-mail',
  url: 'URL do site',
  termo: 'Termo',
  telefone: 'Telefone',
};

export const OSINT_PLACEHOLDER: Record<string, string> = {
  login: 'username do GitHub',
  username: 'username, sem @',
  numero: 'número',
  nome: 'NOME COMPLETO COMO NOS AUTOS',
  dominio: 'empresa.com.br',
  email: 'pessoa@empresa.com.br',
  url: 'https://site.com.br/...',
  termo: 'nome, domínio ou termo',
  telefone: '(27) 99999-1234',
};

/** "Instagram · perfil" -> grupo "Instagram", nome "perfil". */
export function splitLabel(label: string): { group: string; name: string } {
  const [group, ...rest] = label.split(' · ');
  return rest.length ? { group, name: rest.join(' · ') } : { group: 'Outros', name: label };
}

/** Agrupa os tipos pelo prefixo do rótulo, mantendo a ordem em que o ratosint os lista. */
export function groupKinds(kinds: OsintKind[]): { group: string; kinds: OsintKind[] }[] {
  const groups = new Map<string, OsintKind[]>();
  for (const k of kinds) {
    const { group } = splitLabel(k.label);
    groups.set(group, [...(groups.get(group) ?? []), k]);
  }
  return [...groups].map(([group, list]) => ({ group, kinds: list }));
}

export function kindLabel(kinds: OsintKind[] | undefined, kind: string): string {
  return kinds?.find((k) => k.kind === kind)?.label ?? kind;
}

export const JOB_STATUS_TEXT: Record<OsintJobStatus, string> = {
  pending: 'na fila',
  running: 'rodando',
  done: 'pronto',
  error: 'erro',
};

export const NOTE_KIND_LABEL: Record<CsiNoteKind, string> = {
  nota: 'nota',
  fato: 'fato',
  link: 'link',
  telefone: 'telefone',
  email: 'e-mail',
  endereco: 'endereço',
};

export const TARGET_KIND_LABEL: Record<CsiTargetKind, string> = { pessoa: 'pessoa', empresa: 'empresa' };
