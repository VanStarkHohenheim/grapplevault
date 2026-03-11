import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import type { Video } from '@/types';

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/video/${video.id}`} className="group block">
      <div className="glass-card rounded-2xl overflow-hidden">

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {video.poster_url && (
            <img
              src={video.poster_url}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {/* Overlay + icône play */}
          <div className="absolute inset-0 flex items-center justify-center transition-colors duration-300"
            style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <PlayCircle className="text-white w-7 h-7" />
            </div>
          </div>

          {/* Badge competition */}
          {video.competition_context && (
            <span
              className="absolute top-2 right-2 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {video.competition_context}
            </span>
          )}
        </div>

        {/* Texte */}
        <div className="p-4 relative z-10">
          <h3 className="font-bold text-slate-100 group-hover:text-yellow-400 transition-colors duration-200 line-clamp-2 text-sm leading-snug">
            {video.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{video.description}</p>
        </div>

      </div>
    </Link>
  );
}
