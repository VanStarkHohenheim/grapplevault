'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  url: string | null;
  onUpload: (url: string) => void;
  size?: number;
}

// IMPORTANT : "export default" est obligatoire ici
export default function AvatarUploader({ url, onUpload, size = 150 }: Props) {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onUpload(data.publicUrl);

    } catch (error) {
      console.error(error);
      toast.error("Échec de l'upload. Vérifiez le format du fichier.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group mx-auto md:mx-0" style={{ width: size, height: size }}>
      <div className="rounded-full overflow-hidden border-4 border-slate-800 bg-slate-900 w-full h-full flex items-center justify-center relative shadow-xl">
        {url ? (
          <img src={url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User size={size / 2} className="text-slate-600" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-400" size={30} />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0">
        <label className="bg-yellow-400 hover:bg-yellow-300 text-black p-2 rounded-full cursor-pointer shadow-lg flex items-center justify-center transition-transform hover:scale-110">
          <Camera size={20} />
          <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}