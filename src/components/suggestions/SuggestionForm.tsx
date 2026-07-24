import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { api } from "@/lib/api";
import { toast } from 'sonner';

const suggestionSchema = z.object({
  title: z.string().min(5, 'Título muito curto').max(100, 'Título muito longo'),
  description: z.string().min(20, 'Contexto muito curto').max(500, 'Contexto muito longo'),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

interface SuggestionFormProps {
  onSuccess?: () => void;
}

export function SuggestionForm({ onSuccess }: SuggestionFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
  });

  const onSubmit = async (data: SuggestionFormData) => {
    if (!user) {
      toast.error('Faça login para enviar sugestões');
      return;
    }

    setIsSubmitting(true);
    try {
      // O user_id vem do token no backend — não precisa de apelido
      await api.post('/suggestions', {
        title: data.title,
        description: data.description,
      });
      toast.success('Sugestão enviada com sucesso!');
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('Erro ao enviar sugestão');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg border border-code-border bg-code-bg/60 p-5 md:p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        <span className="text-primary">&gt;</span> deixar uma sugestão
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            placeholder="Título da ideia — ex: como auditar dependências npm"
            className="bg-background/50 font-mono"
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Textarea
            placeholder="Contexto — por que isso seria útil?"
            className="min-h-28 resize-none bg-background/50 font-mono"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            {isSubmitting ? 'enviando...' : 'enviar sugestão →'}
          </button>
        </div>
      </form>
    </div>
  );
}
