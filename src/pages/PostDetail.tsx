import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CommentSection } from '@/components/comments/CommentSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Post } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User as UserIcon, Calendar, Clock, ArrowLeft, Tag as TagIcon, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from "@/lib/api";
import { isAxiosError } from 'axios';
import { readingTime } from "@/lib/readingTime";
import { PostVoteButton } from "@/components/posts/PostVoteButton";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isMember } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      setIsLoading(true);
      setNotFound(false);
      try {
        // O Backend agora retorna tudo pronto: Post + Author + Tags
        const response = await api.get<Post>(`/posts/${slug}`);
        setPost(response.data);
      } catch (error) {
        // O back responde 404 tanto para post inexistente quanto para post de membros
        // aberto por quem não é membro (não revela que ele existe).
        if (isAxiosError(error) && error.response?.status === 404) setNotFound(true);
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, user?.id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-12">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    // Quem não é membro pode estar batendo num post restrito: oferece o caminho em vez de erro seco.
    const maybeRestricted = notFound && !isMember;
    return (
      <Layout>
        <div className="container max-w-xl py-16 text-center space-y-6 animate-fade-in">
          {maybeRestricted ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Post não encontrado ou exclusivo para membros</h1>
                <p className="text-muted-foreground">
                  Se este link veio da área de membros, ele só abre para membros ativos.
                  {user
                    ? ' Sua conta ainda não tem membership ativa.'
                    : ' Entre na sua conta para continuar.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!user && (
                  <Button asChild className="gap-2">
                    <Link to="/login">
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/about">Como virar membro</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Home
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Post não encontrado</h1>
              <Button asChild variant="outline">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Home
                </Link>
              </Button>
            </>
          )}
        </div>
      </Layout>
    );
  }

  // Tempo de leitura (mesmo cálculo usado na lista de posts)
  const readingTimeMin = readingTime(post.content);

  return (
    <Layout>
      <article className="container max-w-4xl py-12">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para posts
        </Link>

        {/* Header */}
        <header className="space-y-6 mb-12 animate-fade-in">
          {/* Badge de membros + Tags vindas do Backend */}
          {(post.visibility === 'members' || (post.tags && post.tags.length > 0)) && (
            <div className="flex flex-wrap gap-2">
              {post.visibility === 'members' && (
                <Badge className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                  <Lock className="w-3 h-3" />
                  Membros
                </Badge>
              )}
              {post.tags?.map((tag) => (
                <Badge key={tag.id} className="tag-badge bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={post.author.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-mono text-sm">
                  {post.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{post.author.username}</p>
                <p className="text-xs text-muted-foreground">Autor</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readingTimeMin} min de leitura
              </span>
            </div>

            <div className="ml-auto">
              <PostVoteButton
                postId={post.id}
                initialCount={post.upvotes_count ?? 0}
                initialVoted={post.has_voted ?? false}
                variant="inline"
              />
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <div className="relative rounded-xl overflow-hidden mb-12 animate-slide-up shadow-lg">
            <img 
              src={post.cover_image} 
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        {/* Content - Renderização com React Markdown e Tailwind Typography */}
        <div className="prose prose-invert prose-primary max-w-none w-full text-lg leading-relaxed mb-16 animate-fade-in">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Comments Section */}
        <div className="border-t border-border/50 pt-12">
          <CommentSection postId={post.id} />
        </div>
      </article>
    </Layout>
  );
};

export default PostDetail;