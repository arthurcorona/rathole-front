import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import { SuggestionForm } from '@/components/suggestions/SuggestionForm';
import { useAuth } from '@/contexts/AuthContext';
import { Suggestion } from "@/types";
import { api } from "@/lib/api";
import { Link } from 'react-router-dom';

interface SuggestionWithVoted extends Suggestion {
  has_voted?: boolean;
}

type SortBy = 'votos' | 'recentes';

const Suggestions = () => {
  const { user } = useAuth();
  const shellUser = user?.username || 'corona';
  const [suggestions, setSuggestions] = useState<SuggestionWithVoted[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('votos');

  const fetchSuggestions = async () => {
    try {
      const response = await api.get<SuggestionWithVoted[]>('/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const sorted = useMemo(() => {
    const list = [...suggestions];
    if (sortBy === 'recentes') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      list.sort((a, b) => b.upvotes_count - a.upvotes_count);
    }
    return list;
  }, [suggestions, sortBy]);

  return (
    <Layout>
      {/* Terminal hero */}
      <section className="container pt-10 md:pt-14">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-code-border bg-code-bg shadow-xl animate-fade-in">
          <div className="flex items-center gap-2 border-b border-code-border bg-muted/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-muted-foreground">{shellUser}@rathole: ~/sugestoes</span>
          </div>

          <div className="space-y-4 p-5 text-sm leading-relaxed md:p-6">
            <div>
              <p>
                <span className="text-primary">{shellUser}@rathole</span>
                <span className="text-muted-foreground">:~$</span> cat ./sugestoes.md
              </p>
              <p className="mt-1 text-muted-foreground">
                Sugira temas para novos posts e vote nas sugestões que você mais gostaria de ver.
                As mais votadas têm prioridade!
              </p>
            </div>

            <p className="cursor-blink">
              <span className="text-primary">{shellUser}@rathole</span>
              <span className="text-muted-foreground">:~$</span> ./nova-sugestao
            </p>
          </div>
        </div>
      </section>

      {/* Formulário / login */}
      <section className="container py-8 md:py-10">
        <div className="mx-auto max-w-3xl">
          {user ? (
            <SuggestionForm onSuccess={fetchSuggestions} />
          ) : (
            <div className="rounded-lg border border-code-border bg-code-bg/60 p-6 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Faça login pra deixar uma sugestão e votar nos temas.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
              >
                entrar →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Lista */}
      <section className="container pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">
                <span className="text-muted-foreground">~/</span>sugestões
              </h2>
              <span className="text-sm text-muted-foreground">
                {suggestions.length} {suggestions.length === 1 ? 'ideia' : 'ideias'} na toca
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {(['votos', 'recentes'] as SortBy[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    sortBy === opt
                      ? 'border border-primary/40 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground cursor-blink">
              <span className="text-primary">{shellUser}@rathole</span>
              <span className="text-muted-foreground">:~$</span> carregando sugestões
            </p>
          ) : suggestions.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma sugestão ainda. Seja o primeiro!</p>
          ) : (
            <div className="divide-y divide-border/40 border-t border-border/40">
              {sorted.map((s) => (
                <SuggestionCard key={s.id} suggestion={s} onVoteChange={fetchSuggestions} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Suggestions;
