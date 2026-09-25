import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Crown, Lock, LogIn, Radio, Search, FileText, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { RadarDaily } from '@/components/radar/RadarDaily';

/** Barra de título + corpo no padrão de terminal usado nas outras páginas. */
function Terminal({ user, children }: { user: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-code-border bg-code-bg shadow-xl animate-fade-in">
      <div className="flex items-center gap-2 border-b border-code-border bg-muted/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
        <span className="h-3 w-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-muted-foreground">{user}@rathole: ~/rataria</span>
      </div>
      <div className="space-y-4 p-5 text-sm leading-relaxed md:p-6">{children}</div>
    </div>
  );
}

function Prompt({ user, cmd }: { user: string; cmd: string }) {
  return (
    <p>
      <span className="text-primary">{user}@rathole</span>
      <span className="text-muted-foreground">:~$</span> {cmd}
    </p>
  );
}

/** O que a Rataria oferece. Reaproveitado na landing e no `ls` dos membros. */
const MODULES = [
  { icon: Radio, name: 'radar/', desc: 'edição diária de notícias de segurança e privacidade, curada à mão' },
  { icon: FileText, name: 'posts/', desc: 'artigos exclusivos, marcados com o cadeado' },
  { icon: Search, name: 'osint/', desc: 'painel de consultas OSINT (em breve)' },
];

/** Landing para visitante ou leitor sem membership ativa. */
function RatariaLanding({ loggedIn }: { loggedIn: boolean }) {
  const shellUser = 'visitante';
  return (
    <Layout>
      <section className="container pt-10 md:pt-14">
        <Terminal user={shellUser}>
          <div>
            <Prompt user={shellUser} cmd="cd ~/rataria" />
            <p className="mt-1 text-destructive/90">bash: cd: rataria: Permission denied</p>
          </div>

          <div>
            <Prompt user={shellUser} cmd="cat MEMBERS.md" />
            <p className="mt-1 text-muted-foreground">
              A Rataria é a toca dos membros do RatHole. Quem apoia o blog ganha acesso a:
            </p>
            <ul className="mt-3 space-y-2">
              {MODULES.map(({ icon: Icon, name, desc }) => (
                <li key={name} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <span className="font-mono text-foreground">{name}</span>{' '}
                    <span className="text-muted-foreground">— {desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Prompt user={shellUser} cmd="sudo su rato" />
            <p className="mt-1 text-muted-foreground">
              {loggedIn
                ? 'Sua conta ainda não tem membership ativa. A membership é liberada pelo corona: fale comigo pela página Sobre.'
                : 'Já é membro? Entre na sua conta. Ainda não? Fale comigo pela página Sobre.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {!loggedIn && (
                <Button asChild className="gap-2">
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="gap-2">
                <Link to="/about">
                  Como virar membro
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <p className="cursor-blink">
            <span className="text-primary">{shellUser}@rathole</span>
            <span className="text-muted-foreground">:~$</span>
          </p>
        </Terminal>
      </section>
    </Layout>
  );
}

const Rataria = () => {
  const { user, loading, isMember, isAdmin } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center text-muted-foreground animate-pulse">Carregando...</div>
      </Layout>
    );
  }

  if (!isMember) return <RatariaLanding loggedIn={!!user} />;

  const shellUser = user?.username || 'rato';
  const until = user?.member_until ? new Date(user.member_until) : null;

  return (
    <Layout>
      {/* hero de terminal */}
      <section className="container pt-10 md:pt-14">
        <Terminal user={shellUser}>
          <div>
            <Prompt user={shellUser} cmd="whoami" />
            <p className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
              <Crown className="h-4 w-4 text-primary" />
              {isAdmin
                ? 'admin · acesso total'
                : until
                  ? `membro · ativo até ${format(until, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                  : 'membro'}
            </p>
          </div>

          <div>
            <Prompt user={shellUser} cmd="ls ~/rataria" />
            <ul className="mt-1 grid gap-1 sm:grid-cols-3">
              {MODULES.map(({ icon: Icon, name }) => (
                <li key={name} className="flex items-center gap-2 font-mono text-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {name}
                </li>
              ))}
            </ul>
          </div>

          <p className="cursor-blink">
            <span className="text-primary">{shellUser}@rathole</span>
            <span className="text-muted-foreground">:~$</span>
          </p>
        </Terminal>
      </section>

      {/* módulos */}
      <section className="container py-12 md:py-16">
        <div className="mb-6 flex flex-col gap-1">
          <h2 className="text-2xl font-bold">
            <span className="text-muted-foreground">~/</span>rataria
          </h2>
          <span className="text-sm text-muted-foreground">área de membros · conteúdo exclusivo</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RadarDaily />

          {/* placeholder da próxima feature */}
          <Card className="border-dashed border-border/60 bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                <Search className="h-5 w-5" />
                Painel OSINT
                <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  em breve
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Consultas de domínio, IP e CVE direto daqui, sem limite para membros.
            </CardContent>
          </Card>

          {/* atalho para os posts restritos */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/60 md:col-span-2">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <Lock className="h-5 w-5 shrink-0 text-primary" />
              <p className="flex-1 text-sm text-muted-foreground">
                Posts marcados com <span className="font-medium text-foreground">Membros</span> aparecem para você
                na lista normal de posts. Procure o cadeado.
              </p>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/">
                  ver posts
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Rataria;
