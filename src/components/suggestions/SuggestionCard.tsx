import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from "@/lib/api";
import { Suggestion } from "@/types";
import { toast } from 'sonner';

// O backend manda 'has_voted' calculado na query
interface SuggestionWithVoted extends Suggestion {
  has_voted?: boolean;
}

interface SuggestionCardProps {
  suggestion: SuggestionWithVoted;
  onVoteChange?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function SuggestionCard({ suggestion, onVoteChange }: SuggestionCardProps) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(suggestion.has_voted || false);
  const [votesCount, setVotesCount] = useState(suggestion.upvotes_count);

  const handleVote = async () => {
    if (!user) {
      toast.error('Faça login para votar');
      return;
    }

    setIsVoting(true);
    try {
      if (hasVoted) {
        await api.delete(`/suggestions/${suggestion.id}/vote`);
        setHasVoted(false);
        setVotesCount((prev) => Math.max(0, prev - 1));
      } else {
        await api.post(`/suggestions/${suggestion.id}/vote`);
        setHasVoted(true);
        setVotesCount((prev) => prev + 1);
      }
      onVoteChange?.();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Erro ao processar voto');
      setHasVoted(!hasVoted);
      setVotesCount((prev) => (hasVoted ? prev + 1 : prev - 1));
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex gap-4 py-6">
      {/* caixa de voto */}
      <button
        onClick={handleVote}
        disabled={isVoting}
        aria-label={hasVoted ? 'Remover voto' : 'Votar'}
        className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border transition-colors disabled:opacity-50 ${
          hasVoted
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary'
        }`}
      >
        <ArrowUp className="h-4 w-4" />
        <span className="text-sm font-bold">{votesCount}</span>
      </button>

      {/* conteúdo */}
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-semibold text-primary">@{suggestion.user?.username || 'anônimo'}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{formatDate(suggestion.created_at)}</span>
        </div>

        <h3 className="text-base font-bold leading-snug tracking-tight md:text-lg">
          {suggestion.title}
        </h3>

        {suggestion.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {suggestion.description}
          </p>
        )}
      </div>
    </div>
  );
}
