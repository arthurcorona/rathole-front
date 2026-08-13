import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';

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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md relative bg-card/80 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold">Link inválido</CardTitle>
            <CardDescription>
              Este link de redefinição está incompleto ou expirou.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Pedir um novo link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <Card className="w-full max-w-md relative bg-card/80 backdrop-blur-xl border-border/50 animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 rounded-xl bg-primary/10 border border-primary/20 w-fit">
            <Terminal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Nova senha</CardTitle>
            <CardDescription className="mt-2">Escolha uma nova senha para sua conta</CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Nova senha
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                className="bg-secondary/50"
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
                className="bg-secondary/50"
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
      </Card>
    </div>
  );
};

export default ResetPassword;
