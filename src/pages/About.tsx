import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Sparkles, 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Youtube,
  ExternalLink,
  Clipboard,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const YOUTUBE_URL = 'https://www.youtube.com/@coronasec';

const projects = [
  {
    title: 'Homelab',
    description:
      'Raspberry Pi 4 com Docker, meu laboratório de DevOps, redes e cibersegurança: reverse proxy, monitoramento com Prometheus/Grafana e o coletor que alimenta o Radar deste blog.',
    tech: ['Raspberry Pi', 'Docker', 'Nginx', 'Python', 'Grafana', 'Prometheus'],
    url: 'https://github.com/arthurcorona/homelab',
  },
  {
    title: 'VibroLearn',
    description:
      'Framework open-source em Python para diagnóstico de falhas em máquinas industriais através de análise de vibração e machine learning. Contribuo com melhorias no código via iniciação científica no IFES.',
    tech: ['Python', 'scikit-learn', 'TensorFlow', 'PyTorch'],
    url: 'https://github.com/arthurcorona/vibrolearn', 
  },
  {
    title: 'RatHole',
    description: 'Este blog: área Prime para membros, radar de notícias de segurança, busca full-text e painel admin.',
    tech: ['React', 'TypeScript', 'Fastify', 'PostgreSQL'],
    url: 'https://github.com/arthurcorona/rathole-front',
  },
];

const About = () => {
  const [copied, setCopied] = useState(false);

  const gpgKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEabcDpRYJKwYBBAHaRw8BAQdAx7HG/t6hZlK0a5tu6EnO0yMI86pbd052tsej
2EnkahW0HGNvcm9uYSA8Y29yb25hZ2dwQGdtYWlsLmNvbT6ImQQTFgoAQRYhBJGe
d+OpyfPI+pHyvhvEnWjCauYqBQJptwOlAhsDBQkFpLHLBQsJCAcCAiICBhUKCQgL
AgQWAgMBAh4HAheAAAoJEBvEnWjCauYqsxoBAPMim0B+jdgqv8owzeIvqOkjunU/
Hht1ICJ7Er43IsLXAP9bOhc7sDNaXfejsb/LAofN+ivapPLoc4nCRr8O/y66Drg4
BGm3A6USCisGAQQBl1UBBQEBB0CgDgtTpukUX7qJJKKctLlkbarsbO8GUmaXVde1
phtUYAMBCAeIfgQYFgoAJhYhBJGed+OpyfPI+pHyvhvEnWjCauYqBQJptwOlAhsM
BQkFpLHLAAoJEBvEnWjCauYqQokBAPAUPLtxVYwic+KQOT6A4rkFl5iCCJyWRkpm
upNu0a+uAP9Yf+gRSkb2HP6bhBqKoWObzOuIMlYUQeGH+OznZo1hCA==
=xFQz
-----END PGP PUBLIC KEY BLOCK-----`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gpgKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      {/* Hero Minimalista */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative py-20 md:py-28 z-10">
          <div className="grid md:grid-cols-2 gap-12 items-start animate-fade-in">
            
            {/* Esquerda: Bio */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Arthur Corona
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Um cara muito simples. Hoje atuo como Analista de QA e desenvolvimento web.
                Nas horas vagas eu sou do cyber: pentesting e AppSec. Fora das telas, também
                tenho muitos hobbies: livros, jiu-jitsu, mergulho, aquarismo... Tô tentando
                voltar pro{' '}
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  YouTube
                </a>{' '}
                também, que é uma coisa que curto bastante.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <a href="https://github.com/arthurcorona" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://x.com/imarthurcorona" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com/in/arthurcorona" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="mailto:arthurcorona.business@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Direita: Contato Direto*/}
            <div className="space-y-6 md:pl-8 md:border-l border-border/40">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Comunicação Rápida</h3>
                <a 
                  href="https://t.me/corona_great" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-mono text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  t.me/corona_great
                </a>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Comunicação Segura (PGP)</h3>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Clipboard className="h-3 w-3" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="p-4 rounded bg-muted/50 border border-border/40 font-mono text-xs text-muted-foreground overflow-x-auto">
                  <code>{gpgKey}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* /now */}
      <section className="container py-12 md:py-16 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">/now</h2>
          <span className="text-sm text-muted-foreground">O que está ocupando meu tempo no momento</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {([
            { icon: '🛡️', title: 'AppSec', desc: 'Estudando pentest web com Burp Suite' },
            { icon: '🎓', title: 'Engenharia de Controle e Automação', desc: 'Graduação no IFES' },
            { icon: '🖥️', title: 'Homelab', desc: 'Expandindo a infra no Raspberry Pi' },
            { icon: '▶️', title: 'YouTube · @coronasec', desc: 'Voltando a gravar vídeos sobre cyber', href: YOUTUBE_URL },
          ] as { icon: string; title: string; desc: string; href?: string }[]).map(({ icon, title, desc, href }) => {
            const body = (
              <>
                <span className="text-xl leading-none mt-0.5">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </>
            );
            const box = 'flex items-start gap-3 p-4 rounded-lg bg-card/30 border border-border/40';
            return href ? (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${box} group hover:border-primary/40 hover:bg-card/50 transition-colors`}
              >
                {body}
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ) : (
              <div key={title} className={box}>
                {body}
              </div>
            );
          })}
        </div>
      </section>

      {/* Stack */}
      <section className="container py-12 md:py-16 space-y-6 border-t border-border/40">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Stack</h2>
          <span className="text-sm text-muted-foreground">Tecnologias com as quais trabalho</span>
        </div>

        <div className="space-y-5">
          {[
            {
              label: 'Frontend',
              items: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
            },
            {
              label: 'Backend',
              items: ['Node.js', 'Fastify', 'PostgreSQL', 'Drizzle ORM', 'Python'],
            },
            {
              label: 'Infra',
              items: ['Docker', 'Linux', 'Nginx', 'Prometheus', 'Grafana'],
            },
            {
              label: 'Estudando',
              items: ['AppSec', 'Pentest', 'Burp Suite'],
            },
          ].map(({ label, items }) => (
            <div key={label} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest w-20 shrink-0">
                {label}
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Badge key={item} variant="secondary" className="text-xs bg-muted/50">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projetos */}
      <section className="container py-12 md:py-16 space-y-8 border-t border-border/40 mb-12">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Projetos</h2>
          <span className="text-sm text-muted-foreground">
            Alguns dos projetos que construí
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="h-full bg-card/30 border-border/40 shadow-none hover:border-primary/40 hover:bg-card/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="group-hover:text-primary transition-colors">
                      {project.title}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs bg-muted/50">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default About;