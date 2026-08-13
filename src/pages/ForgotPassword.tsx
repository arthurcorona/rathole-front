import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Terminal, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

      <Card className="w-full max-w-md relative bg-card/80 backdrop-blur-xl border-border/50 animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 rounded-xl bg-primary/10 border border-primary/20 w-fit">
            <Terminal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Esqueci a senha</CardTitle>
            <CardDescription className="mt-2">
              {sent ? 'Verifique seu e-mail' : 'Enviaremos um link para redefinir sua senha'}
            </CardDescription>
          </div>
        </CardHeader>

        {sent ? (
          <CardContent className="space-y-4 text-center">
            <MailCheck className="h-10 w-10 mx-auto text-primary" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.
              Confira sua caixa de entrada (e o spam). O link expira em 1 hora.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                  className="bg-secondary/50"
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
      </Card>
    </div>
  );
};

export default ForgotPassword;
