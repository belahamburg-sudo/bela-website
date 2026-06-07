"use client";

import { useRouter } from "next/navigation";
import { Panel } from "@/components/admin/ui";
import { FileUpload } from "@/components/admin/file-upload";
import { useToast } from "@/components/admin/toast";

export function MediaUploader() {
  const router = useRouter();
  const { success } = useToast();

  return (
    <Panel
      title="Datei hochladen"
      description="Marketing-Bilder und -Videos für die öffentliche Website."
    >
      <FileUpload
        bucket="media"
        prefix="library"
        kind="file"
        label="Datei hochladen"
        hint="Bilder & Videos — bis 500MB"
        onUploaded={() => {
          success("Datei hochgeladen.");
          router.refresh();
        }}
      />
    </Panel>
  );
}
