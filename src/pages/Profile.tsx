import { useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { toast } from 'sonner';

import { User as UserIcon, Mail, Link as LinkIcon, Save, Camera, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth() as { user: User | null, updateUser: any };
  const [isLoading, setIsLoading] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  // captura o arquivo e manda pro fastify
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo inválido. Use JPG, PNG ou WebP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData);
      // back retorna o link
      setAvatarUrl(response.data.url);
      toast.success('Upload concluído! Salve as alterações.');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.put('/auth/profile', {
        username,
        avatar_url: avatarUrl
      });

      updateUser({
        username, 
        avatar_url: avatarUrl
      })
      
      toast.success('Perfil atualizado! Recarregue para ver as mudanças.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12 animate-fade-in">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Meu Perfil</CardTitle>
            <CardDescription>Gerencie suas informações públicas no RatHole</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-8">
              
              {/*foto clicável */}
              <div className="flex flex-col items-center gap-4 py-4">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar className="h-24 w-24 border-2 border-primary/20 transition-opacity group-hover:opacity-75">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-mono">
                      {username.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Ícone que aparece ao passar o mouse ou durante o upload */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <Camera className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>

                {/* Input de arquivo invisível */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden" 
                />

                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Clique na foto para alterar
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> Nome de Usuário
                  </Label>
                  <Input 
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Seu nome no blog"
                    className="bg-secondary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-secondary/10 cursor-not-allowed opacity-60"
                  />
                  <p className="text-[10px] text-muted-foreground italic">O email não pode ser alterado no momento.</p>
                </div>

                {/* Mantemos o input de URL caso você queira colar um link do Google Photos ou Imgur */}
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> URL da Foto (Ou faça upload acima)
                  </Label>
                  <Input 
                    id="avatar" 
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://suafoto.com/imagem.png"
                    className="bg-secondary/30"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t border-border/50 pt-6">
              <Button type="submit" disabled={isLoading || isUploading} className="gap-2">
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                <Save className="h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;