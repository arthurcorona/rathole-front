import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

const AdminEditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get('/posts');
        const post = response.data.find((p: any) => p.id === id);
        if (post) {
          setTitle(post.title);
          setExcerpt(post.excerpt || '');
          setContent(post.content || '');
          setCoverImage(post.cover_image || '');
          setStatus(post.status);
        }
      } catch (error) {
        console.error('Erro ao buscar post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/posts/${id}`, {
        title,
        excerpt,
        content,
        cover_image: coverImage,
        status,
      });
      alert('Post atualizado com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar o post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-3xl py-12 text-center text-muted-foreground animate-pulse">
          Carregando post...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <h1 className="text-2xl font-bold mb-6">Editar Post</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Título</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Resumo</label>
            <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Imagem de capa (URL)</label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Conteúdo (Markdown)</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEditPost;