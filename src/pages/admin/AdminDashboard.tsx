import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Post } from '@/types';
import { Plus, Edit, Trash2, FileText, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminDashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get<Post[]>('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
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
        
      </div>
    </Layout>
  );
};

export default AdminDashboard;