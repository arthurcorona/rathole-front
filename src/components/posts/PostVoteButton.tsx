import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PostVoteButtonProps {
  postId: string;
  initialCount?: number;
  initialVoted?: boolean;
  /** 'compact' pra lista, 'inline' pra página do post */
  variant?: 'compact' | 'inline';
}

export function PostVoteButton({
  postId,
  initialCount = 0,
  initialVoted = false,
  variant = 'compact',
}: PostVoteButtonProps) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);

  const handleVote = async (e: React.MouseEvent) => {
    // evita navegar quando o botão está dentro de um <Link> (lista)
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Faça login para votar');
      return;
    }

    setIsVoting(true);
    try {
      if (hasVoted) {
        await api.delete(`/posts/${postId}/vote`);
        setHasVoted(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        await api.post(`/posts/${postId}/vote`);
        setHasVoted(true);
        setCount((c) => c + 1);
      }
    } catch (error) {
      console.error('Error voting on post:', error);
      toast.error('Erro ao processar voto');
    } finally {
      setIsVoting(false);
    }
  };

  const base =
    'flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border transition-colors disabled:opacity-50';
  const size = variant === 'inline' ? 'h-16 w-14' : 'h-14 w-12';
  const state = hasVoted
    ? 'border-primary/50 bg-primary/10 text-primary'
    : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary';

  return (
    <button
      onClick={handleVote}
      disabled={isVoting}
      aria-label={hasVoted ? 'Remover voto' : 'Votar'}
      title={hasVoted ? 'Remover voto' : 'Votar'}
      className={`${base} ${size} ${state}`}
    >
      <ArrowUp className="h-4 w-4" />
      <span className="text-sm font-bold">{count}</span>
    </button>
  );
}
