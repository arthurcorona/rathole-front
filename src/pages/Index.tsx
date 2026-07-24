import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostGrid } from '@/components/posts/PostGrid';
import { NewPostForm } from '@/components/posts/NewPostForm';
import { api } from "@/lib/api"; 
import { useAuth } from "@/contexts/AuthContext"; 
import { Post } from "@/types";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"; 

const Index = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const { toast } = useToast();

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Post[]>('/posts');
      setPosts(response.data);
      setHasError(false);
    } catch (error) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const publishPost = async (postId: string) => {
    try {
      await api.put(`/posts/${postId}`, { status: 'published' });
      
      toast({ title: "Sucesso", description: "Post publicado!" });
      loadPosts(); 
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao publicar." });
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadPosts();
    }
  }, [authLoading, user]); 

  return (
    <Layout>
      <section className="container pt-10 md:pt-14">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-code-border bg-code-bg shadow-xl animate-fade-in">
          {/* barra de título do terminal */}
          <div className="flex items-center gap-2 border-b border-code-border bg-muted/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-muted-foreground">corona@rathole: ~</span>
          </div>

          {/* corpo do terminal */}
          <div className="space-y-4 p-5 text-sm leading-relaxed md:p-6">
            <div>
              <p>
                <span className="text-primary">corona@rathole</span>
                <span className="text-muted-foreground">:~$</span> cat README.md
              </p>
              <p className="mt-1 text-muted-foreground">
                Seja bem-vindo, pequeno rato. Ambiente de aprendizados, devaneios, ideias e reflexões.
              </p>
            </div>

            <div>
              <p>
                <span className="text-primary">corona@rathole</span>
                <span className="text-muted-foreground">:~$</span>{' '}
                <Link
                  to="/about"
                  className="underline decoration-dotted underline-offset-4 hover:text-primary transition-colors"
                >
                  whoami
                </Link>
              </p>
              <p className="mt-1 text-muted-foreground">corona</p>
            </div>

            <div>
              <p>
                <span className="text-primary">corona@rathole</span>
                <span className="text-muted-foreground">:~$</span> fortune
              </p>
              <p className="mt-1 text-muted-foreground">
                “Onde estão os seus sonhos? O que fez de seus anos? Onde sepultou sua melhor época? Você viveu ou não?”
                <span className="mt-1 block text-foreground">— Dostoiévski</span>
              </p>
            </div>

            <p className="cursor-blink">
              <span className="text-primary">corona@rathole</span>
              <span className="text-muted-foreground">:~$</span>
            </p>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16 space-y-8">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              <span className="text-muted-foreground">~/</span>posts
            </h2>
            <span className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'} · ordenado por data
            </span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowNewPostForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {showNewPostForm ? 'fechar' : 'novo post'}
            </button>
          )}
        </div>

        {/* Aqui garantimos que passamos 'author' corretamente */}
        {isAdmin && showNewPostForm && user && (
          <NewPostForm
            author={user} 
            onCreated={() => {
              setShowNewPostForm(false);
              loadPosts();
            }}
            onCancel={() => setShowNewPostForm(false)}
          />
        )}

        <PostGrid
          posts={posts}
          isLoading={isLoading || authLoading}
          isAdmin={isAdmin}
          hasError={hasError}
          onPublishPost={publishPost}
        />
      </section>
    </Layout>
  );
};

export default Index;