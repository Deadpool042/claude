import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import type { BackupEntry, MaintenanceStatus } from "../types";
import { formatBytes, formatDate } from "./utils/helpers";
import { BackupDeleteDialog } from "./dialogs/BackupDeleteDialog";
import { BackupRestoreDialog } from "./dialogs/BackupRestoreDialog";

interface BackupsTabProps {
  maintenanceStatus: MaintenanceStatus | null;
  backupEntries: BackupEntry[];
  backupError: string | null;
  isProd: boolean;
  disableRuntimeActions: boolean;
  isBackupRunning: boolean;
  isRefreshingBackups: boolean;
  isRestoringBackup: boolean;
  isDeletingBackup: boolean;
  onRefreshBackups: () => void;
  onRunBackup: () => void;
  onRestoreBackup: (payload: { type: "db" | "uploads" | "full"; db?: string; uploads?: string }) => void;
  onDeleteBackup: (stamp: string) => void;
}

export default function BackupsTab({
  maintenanceStatus,
  backupEntries,
  backupError,
  isProd,
  disableRuntimeActions,
  isBackupRunning,
  isRefreshingBackups,
  isRestoringBackup,
  isDeletingBackup,
  onRefreshBackups,
  onRunBackup,
  onRestoreBackup,
  onDeleteBackup,
}: BackupsTabProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Sauvegardes locales</p>
          <p className="text-xs text-muted-foreground">
            Archive DB + uploads selon la retention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={disableRuntimeActions}
            onClick={onRefreshBackups}
          >
            {isRefreshingBackups ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
            Rafraîchir
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={disableRuntimeActions}
            onClick={onRunBackup}
          >
            {isBackupRunning ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Derniere sauvegarde: {formatDate(maintenanceStatus?.last_backup_at)}</p>
        <p>Prochaine: {formatDate(maintenanceStatus?.next_backup_at)}</p>
        {maintenanceStatus?.last_backup_files ? (
          <p className="truncate">
            Fichiers:{" "}
            {maintenanceStatus.last_backup_files.db
              ? maintenanceStatus.last_backup_files.db.split("/").pop()
              : "db n/a"}
            {" / "}
            {maintenanceStatus.last_backup_files.uploads
              ? maintenanceStatus.last_backup_files.uploads.split("/").pop()
              : "uploads n/a"}
          </p>
        ) : null}
        {maintenanceStatus?.last_backup_keep ? (
          <p>Retention: {String(maintenanceStatus.last_backup_keep)}</p>
        ) : null}
        <p>Derniere restauration: {formatDate(maintenanceStatus?.last_restore_at)}</p>
        {maintenanceStatus?.last_restore_type ? (
          <p>Type restauration: {maintenanceStatus.last_restore_type}</p>
        ) : null}
        {maintenanceStatus?.last_restore_ok === false &&
        maintenanceStatus.last_restore_error ? (
          <p className="text-rose-500">
            Erreur restauration: {maintenanceStatus.last_restore_error}
          </p>
        ) : null}
        {maintenanceStatus?.last_restore_warning ? (
          <p className="text-amber-500">
            Avertissement restauration: {maintenanceStatus.last_restore_warning}
          </p>
        ) : null}
        {maintenanceStatus?.last_restore_cleanup ? (
          <p className="text-muted-foreground">
            Nettoyage medias: {String(maintenanceStatus.last_restore_cleanup.removed)} supprimes /{" "}
            {String(maintenanceStatus.last_restore_cleanup.checked)} controles
            {maintenanceStatus.last_restore_cleanup.truncated ? " (limite)" : ""}
          </p>
        ) : null}
      </div>

      {backupError ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          {backupError}
        </div>
      ) : null}

      {isProd ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          Restauration: placeholder (dépend de la cible).
        </div>
      ) : backupEntries.length === 0 ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          Aucune sauvegarde détectée.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>DB</TableHead>
                <TableHead>Uploads</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupEntries.map((entry) => (
                <TableRow key={entry.stamp}>
                  <TableCell>
                    <div className="text-xs font-medium">{formatDate(entry.createdAt)}</div>
                    <div className="text-[11px] text-muted-foreground">{entry.stamp}</div>
                  </TableCell>
                  <TableCell>
                    {entry.db ? (
                      <code className="text-[11px]">{entry.db.name}</code>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">n/a</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.uploads ? (
                      <code className="text-[11px]">{entry.uploads.name}</code>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">n/a</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-[11px] text-muted-foreground">
                      DB: {formatBytes(entry.db?.size)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Uploads: {formatBytes(entry.uploads?.size)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <BackupRestoreDialog
                        entry={entry}
                        disabled={disableRuntimeActions}
                        busy={isRestoringBackup}
                        onRestore={onRestoreBackup}
                      />
                      <BackupDeleteDialog
                        entry={entry}
                        disabled={disableRuntimeActions}
                        busy={isDeletingBackup}
                        onDelete={onDeleteBackup}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
