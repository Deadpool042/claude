import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/shell/page-layout";
import { EmptyState } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { q } = await searchParams;

  const clients = await prisma.client.findMany({
    ...(q ? { where: { name: { contains: q } } } : {}),
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <PageLayout
      title="Clients"
      description={`${String(clients.length)} client${clients.length !== 1 ? "s" : ""}`}
      toolbar={
        <Link href="/dashboard/clients/new">
          <Button size="sm">
            <Plus className="size-4" />
            Nouveau client
          </Button>
        </Link>
      }
    >
      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un client..."
          className="h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        />
      </form>

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6 text-muted-foreground" />}
          title="Aucun client"
          description={
            q
              ? `Aucun client ne correspond à "${q}".`
              : "Commencez par créer votre premier client."
          }
          action={
            !q ? (
              <Link href="/dashboard/clients/new">
                <Button>
                  <Plus className="size-4" />
                  Créer un client
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Projets</TableHead>
              <TableHead>Créé le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="font-medium hover:underline"
                  >
                    {client.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {[client.firstName, client.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.email ?? "—"}
                </TableCell>
                <TableCell>{client._count.projects}</TableCell>
                <TableCell className="text-muted-foreground">
                  {client.createdAt.toLocaleDateString("fr-FR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageLayout>
  );
}
