import { Layout } from '@/components/layout/Layout';
import { Code2, Sparkles, Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const skills = [
  { category: 'Linguagens', items: ['TypeScript', 'JavaScript', 'Python', 'Java'] },
  { category: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'HTML/CSS'] },
  { category: 'Backend', items: ['Node.js', 'Express', 'Supabase', 'PostgreSQL'] },
  { category: 'Ferramentas', items: ['Git', 'Docker', 'Linux', 'VS Code'] },
];

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
  return (
    <Layout>
      {/* Hero — mesmo padrão do Index */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Sobre mim
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Arthur Corona
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Desenvolvedor apaixonado por tecnologia, café e resolver problemas.
              Construindo coisas na web e compartilhando o que aprendo pelo caminho.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/arthurcorona"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/imarthurcorona"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/arthurcorona"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:seu@email.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="container py-12 md:py-16 space-y-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Habilidades</h2>
          <span className="text-sm text-muted-foreground">
            Tecnologias e ferramentas que uso no dia a dia
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {skills.map((group) => (
            <Card key={group.category} className="bg-card/50 backdrop-blur-sm border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  {group.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Projetos */}
      <section className="container py-12 md:py-16 space-y-8 border-t border-border/40">
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
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/40 transition-colors">
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
                      <Badge key={t} variant="secondary" className="text-xs">
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