import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Post, Suggestion, User } from '@/types';
import { Plus, Edit, Trash2, FileText, ShieldAlert, Lightbulb, Users as UsersIcon, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminDashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get<Post[]>('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get<Suggestion[]>('/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchPosts(), fetchSuggestions(), fetchUsers()]).finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Tem certeza que deseja apagar este post? Essa ação não tem volta!");

    if (confirmDelete) {
      try {
        await api.delete(`/posts/${id}`);
        // Atualiza a lista na tela removendo o post apagado
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error('Erro ao deletar post:', error);
        alert("Erro ao deletar o post. Verifique o console.");
      }
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    const confirmDelete = window.confirm("Tem certeza que deseja apagar esta sugestão?");

    if (confirmDelete) {
      try {
        await api.delete(`/suggestions/${id}`);
        setSuggestions(suggestions.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Erro ao deletar sugestão:', error);
        alert("Erro ao deletar a sugestão. Verifique o console.");
      }
    }
  };

  const handleSetMembership = async (u: User, action: 'grant' | 'revoke') => {
    let member_until: string | null = null;
    if (action === 'grant') {
      // estende a partir de agora, ou da data atual se ainda estiver ativa
      const current = u.member_until ? new Date(u.member_until) : null;
      const base = current && current > new Date() ? current : new Date();
      base.setDate(base.getDate() + 30);
      member_until = base.toISOString();
    }
    try {
      await api.put(`/users/${u.id}/membership`, { member_until });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, member_until } : x)));
    } catch (error) {
      console.error('Erro ao atualizar membership:', error);
      alert('Erro ao atualizar membership. Verifique o console.');
    }
  };

  return (
    <Layout>
      <div className="container max-w-5xl py-12">
        
        {/* Cabeçalho do Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-primary" />
              Painel de Controle
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os posts e o conteúdo do RatHole.
            </p>
          </div>
          
          <Button asChild className="gap-2">
            <Link to="/admin/posts/new">
              <Plus className="h-4 w-4" />
              Novo Post
            </Link>
          </Button>
        </div>

        {/* Lista de Posts */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Carregando dados da base...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nenhum post encontrado</h3>
              <p className="text-muted-foreground mt-1">Você ainda não escreveu nada. Comece seu primeiro post!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Título</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Botão de Ver */}
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link to={`/posts/${post.slug}`} target="_blank" title="Ver post">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        
                        {/* Botão de Editar */}
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                          <Link to={`/admin/posts/edit/${post.id}`} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>

                        {/* Botão de Apagar */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(post.id)}
                          title="Apagar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lista de Sugestões */}
        <div className="mt-10">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            Sugestões
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">
                Carregando sugestões...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Nenhuma sugestão</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Título</th>
                      <th className="px-6 py-4 font-medium">Autor</th>
                      <th className="px-6 py-4 font-medium">Votos</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {suggestions.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{s.title}</td>
                        <td className="px-6 py-4 text-muted-foreground">@{s.user?.username || 'anônimo'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{s.upvotes_count}</td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteSuggestion(s.id)}
                            title="Apagar sugestão"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Usuários / Membership */}
        <div className="mt-10">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <UsersIcon className="h-5 w-5 text-primary" />
            Usuários
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">
                Carregando usuários...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">Nenhum usuário.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Usuário</th>
                      <th className="px-6 py-4 font-medium">Membro</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map((u) => {
                      const active = !!u.member_until && new Date(u.member_until) > new Date();
                      return (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground flex items-center gap-1.5">
                              {u.username}
                              {u.role === 'admin' && (
                                <span className="text-[10px] uppercase text-primary border border-primary/30 rounded px-1">admin</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            {active ? (
                              <span className="inline-flex items-center gap-1.5 text-primary">
                                <Crown className="h-3.5 w-3.5" />
                                até {format(new Date(u.member_until!), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-primary hover:bg-primary/10"
                              onClick={() => handleSetMembership(u, 'grant')}
                              title="Conceder / estender 30 dias"
                            >
                              +30 dias
                            </Button>
                            {active && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:bg-destructive/10"
                                onClick={() => handleSetMembership(u, 'revoke')}
                                title="Revogar membership"
                              >
                                revogar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;