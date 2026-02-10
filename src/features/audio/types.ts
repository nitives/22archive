export type Track = {
  id: string;
  title: string;
  artist: string;
  streamUrl: string; // `/api/media/stream/${id}`
  downloadUrl: string; // `/api/media/download/${id}`
  coverUrl?: string;
  album?: string;
  era?: string;
};
