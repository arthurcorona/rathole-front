import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // O backend sempre responde 200 (anti-enumeração) — não revelamos se o e-mail existe
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (error) {
      console.error('Erro no forgot-password:', error);
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <div className="w-full max-w-md relative overflow-hidden rounded-lg border border-code-border bg-code-bg shadow-xl animate-scale-in">
        {/* barra de título do terminal */}
        <div className="flex items-center gap-2 border-b border-code-border bg-muted/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-muted-foreground">user@rathole: ~/reset</span>
        </div>

        {/* prompt */}
        <div className="px-6 pt-5 text-sm">
          <p>
            <span className="text-primary">user@rathole</span>
            <span className="text-muted-foreground">:~$</span> ./recuperar-senha
          </p>
          <p className="mt-1 text-muted-foreground">
            {sent ? 'Verifique seu e-mail.' : 'Enviaremos um link para redefinir sua senha.'}
          </p>
        </div>

        {sent ? (
          <CardContent className="space-y-4 pt-4 text-center">
            <MailCheck className="h-10 w-10 mx-auto text-primary" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.
              Confira sua caixa de entrada (e o spam). O link expira em 1 hora.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="bg-background/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar link'}
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter className="justify-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar pro login
          </Link>
        </CardFooter>
      </div>
    </div>
  );
};

export default ForgotPassword;
