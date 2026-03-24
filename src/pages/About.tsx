import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Sparkles, 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  ExternalLink,
  Clipboard,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Projetos mantidos iguais
const projects = [
  {
    title: 'Homelab',
    description:
      'Infraestrutura self-hosted em Raspberry Pi 4 com Docker, usada como laboratório de estudos em DevOps, automação, cibersegurança e redes. Inclui reverse proxy, monitoramento com Prometheus/Grafana, automação com n8n e banco PostgreSQL.',
    tech: ['Raspberry Pi', 'Docker', 'Nginx', 'PostgreSQL', 'Grafana', 'Prometheus', 'n8n'],
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
    description: 'Blog pessoal com sistema de sugestões, autenticação e painel admin.',
    tech: ['React', 'Postgres', 'TypeScript', 'Tailwind'],
    url: '#',
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
BGm3A6USCisGAQQBl1UBBQEBB0CgDgtTpukUX7qJJKKctLlkbarsbO8GUmaXVde1f
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
                Um cara muito simples. Atualmente atuando como QA Analyst na Inbazz, 
                sempre buscando estudar e aprender mais. Além de computadores, também tenho
                como hobbies livros e jiu jitsu.
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
                <a href="mailto:seu@email.com" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
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
                  <h3 className="text-sm font-semibold text-foreground">Comunicação Segura (GPG)</h3>
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
          {[
            { icon: '📚', title: 'AWS Developer Associate', desc: 'Preparando para a certificação' },
            { icon: '🖥️', title: 'Homelab', desc: 'Expandindo a infra no Raspberry Pi' },
            { icon: '🔬', title: 'VibroLearn', desc: 'Pesquisa em falhas industriais no IFES' },
            { icon: '🎭', title: 'PlayWroght', desc: 'Integrando Playwright para testes dinâmicos ' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 rounded-lg bg-card/30 border border-border/40">
              <span className="text-xl leading-none mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
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
              items: ['AWS', 'Cibersegurança'],
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