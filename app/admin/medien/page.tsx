import { Image as ImageIcon, HardDrive, Film } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { listBucket, publicUrl, toStorageRef, BUCKETS } from "@/lib/storage";
import { MediaUploader } from "@/components/admin/system/media-uploader";
import { MediaGrid, type MediaItem } from "@/components/admin/system/media-grid";

export const dynamic = "force-dynamic";

const PREFIX = "library";

type StorageObject = {
  name: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: { size?: number; mimetype?: string } | null;
};

const VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "ogv"];

function isVideoName(name: string): boolean {
  const i = name.lastIndexOf(".");
  const ext = i === -1 ? "" : name.slice(i + 1).toLowerCase();
  return VIDEO_EXT.includes(ext);
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default async function MedienPage() {
  const objects = (await listBucket(BUCKETS.media, PREFIX)) as StorageObject[];

  // Storage list can include a folder placeholder row with no metadata/id; skip it.
  const files = objects.filter((o) => o.name && o.id);

  const items: MediaItem[] = files.map((o) => {
    const path = `${PREFIX}/${o.name}`;
    return {
      name: o.name,
      path,
      ref: toStorageRef(BUCKETS.media, path),
      url: publicUrl(BUCKETS.media, path),
      size: o.metadata?.size ?? 0,
      createdAt: o.created_at ?? null,
    };
  });

  const totalBytes = items.reduce((sum, i) => sum + i.size, 0);
  const videoCount = items.filter((i) => isVideoName(i.name)).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Inhalte"
        title="Medien"
        description="Öffentliche Mediathek für Marketing-Videos und -Bilder."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Dateien" value={items.length} icon={ImageIcon} />
        <StatCard label="Videos" value={videoCount} icon={Film} />
        <StatCard label="Speicher" value={formatBytes(totalBytes)} icon={HardDrive} />
      </div>

      <div className="mt-6">
        <MediaUploader />
      </div>

      <div className="mt-6">
        <MediaGrid items={items} />
      </div>
    </div>
  );
}
