import { cn } from "@/lib/utils";
import { EmptyState } from "./ui";
import type { LucideIcon } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
};

const ALIGN: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/** Lightweight, styled table for admin lists. Server-safe (no client JS). */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyIcon,
  emptyTitle = "Keine Einträge",
  emptyDescription,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cream/30",
                  ALIGN[col.align ?? "left"],
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-cream/70",
                    ALIGN[col.align ?? "left"],
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
