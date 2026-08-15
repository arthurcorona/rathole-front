import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// janela de terminal reutilizada nas duas telas de reset
function TerminalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="w-full max-w-md relative overflow-hidden rounded-lg border border-code-border bg-code-bg shadow-xl animate-scale-in">
        <div className="flex items-center gap-2 border-b border-code-border bg-muted/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-muted-foreground">{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('A senha precisa de no mínimo 8 caracteres');
      return;
    }
    if (password !== confirm) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Senha redefinida! Faça login com a nova senha.');
      navigate('/login');
    } catch (error: any) {
      const code = error.response?.data?.code;
      const msg =
        code === 'TOKEN_EXPIRED' ? 'Link expirado. Peça um novo em "Esqueci a senha".'
        : code === 'TOKEN_INVALID' ? 'Link inválido.'
        : 'Erro ao redefinir a senha. Tente novamente.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Sem token na URL → link quebrado
  if (!token) {
    return (
      <TerminalShell title="user@rathole: ~/reset">
        <div className="px-6 pt-5 text-sm">
          <p>
            <span className="text-primary">user@rathole</span>
            <span className="text-muted-foreground">:~$</span> ./nova-senha
          </p>
          <p className="mt-1 text-destructive">erro: link inválido ou incompleto.</p>
        </div>
        <CardFooter className="justify-center pt-4">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Pedir um novo link
          </Link>
        </CardFooter>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell title="user@rathole: ~/reset">
      {/* prompt */}
      <div className="px-6 pt-5 text-sm">
        <p>
          <span className="text-primary">user@rathole</span>
          <span className="text-muted-foreground">:~$</span> ./nova-senha
        </p>
        <p className="mt-1 text-muted-foreground">Escolha uma nova senha para sua conta.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Nova senha
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              className="bg-background/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Confirmar senha
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className="bg-background/50"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </CardFooter>
      </form>
    </TerminalShell>
  );
};

export default ResetPassword;
