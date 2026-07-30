import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface CoverImageInputProps {
  value: string;
  onChange: (url: string) => void;
}

// Campo de capa: aceita colar URL OU fazer upload de arquivo (vai pro Supabase Storage).
export function CoverImageInput({ value, onChange }: CoverImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo inválido. Use JPG, PNG, GIF ou WebP.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData);
      onChange(res.data.url);
      toast.success('Imagem enviada!');
    } catch (err) {
      console.error('Erro no upload da capa:', err);
      toast.error('Erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... ou envie um arquivo →"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-primary/40 px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isUploading ? 'Enviando...' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {value && (
        <img
          src={value}
          alt="Prévia da capa"
          className="h-24 w-auto rounded-md border border-border object-cover"
        />
      )}
    </div>
  );
}
