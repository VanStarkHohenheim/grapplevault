export interface Segment {
  id: string;
  video_id: string;
  start_time: number;
  end_time?: number;
  label: string;
  type: 'KEY_MOMENT' | 'SETUP' | 'FINISH';
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  poster_url: string;
  platform: 'youtube' | 'vimeo';
  duration: number;
  competition_context?: string;
  created_at: string;
  segments?: Segment[]; // Optionnel car on join souvent après
}