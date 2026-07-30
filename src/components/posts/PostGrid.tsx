import { Link } from "react-router-dom";
import { Post } from "@/types";
import { Clock } from 'lucide-react';
import { readingTime } from "@/lib/readingTime";
import { PostVoteButton } from "./PostVoteButton";

interface PostGridProps {
  posts: Post[];
  isLoading?: boolean;
  isAdmin?: boolean;
  hasError?: boolean;
  onPublishPost?: (id: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export const PostGrid = ({ posts, isLoading, isAdmin, hasError, onPublishPost }: PostGridProps) => {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground cursor-blink">
        <span className="text-primary">corona@rathole</span>
        <span className="text-muted-foreground">:~$</span> carregando posts
      </p>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-1">
        <p className="text-muted-foreground">Nenhum post encontrado.</p>
        <p className="text-sm text-muted-foreground/60">
          Provavelmente meu servidor caiu.{' '}
          <a href="https://t.me/corona_great" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
            Reporte o bug.
          </a>{' '}
          que eu resolvo!
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="text-muted-foreground">Nenhum post por aqui ainda.</p>;
  }

  return (
    <div className="divide-y divide-border/40 border-t border-border/40">
      {posts.map((post, index) => (
        <article
          key={post.id}
          className="group flex animate-slide-up gap-4 py-6"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          {/* voto (fora do Link pra não aninhar interativo) */}
          <PostVoteButton
            postId={post.id}
            initialCount={post.upvotes_count ?? 0}
            initialVoted={post.has_voted ?? false}
            variant="compact"
          />

          <div className="flex-1">
            <Link to={`/posts/${post.slug}`} className="block">
              {/* linha de meta: data + autor à esquerda, tempo de leitura à direita */}
              <div className="mb-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-primary">{formatDate(post.created_at)}</span>
                  <span className="font-semibold text-primary">{post.author.username}</span>
                  {isAdmin && post.status === 'draft' && (
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
                      rascunho
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {readingTime(post.content)} min
                </span>
              </div>

              {/* título */}
              <h3 className="text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary md:text-xl">
                {post.title}
              </h3>

              {/* excerpt */}
              {post.excerpt && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              {/* tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded border border-border/60 bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      #{tag.name.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              )}
            </Link>

            {/* ação de admin */}
            {isAdmin && post.status === 'draft' && onPublishPost && (
              <button
                onClick={() => onPublishPost(post.id)}
                className="mt-3 rounded-md border border-primary/40 px-2.5 py-1 text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                publicar
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};
