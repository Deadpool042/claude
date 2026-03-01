"use client";

import { useActionState, useCallback } from "react";
import { updateClientAction } from "../../../_actions/update-client";
import { deleteClientAction } from "../../../_actions/delete-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteButton } from "@/components/shared/delete-button";

interface ClientEditFormProps {
  client: {
    id: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
  };
}

export function ClientEditForm({ client }: ClientEditFormProps) {
  const boundUpdateAction = useCallback(
    (prev: { error: string | null }, formData: FormData) =>
      updateClientAction(client.id, prev, formData),
    [client.id],
  );

  const boundDeleteAction = useCallback(
    (prev: { error: string | null }) => deleteClientAction(client.id, prev),
    [client.id],
  );

  const [state, formAction, isPending] = useActionState(boundUpdateAction, {
    error: null,
  });

  return (
    <div className="space-y-6">
      <Card className="max-w-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
            <CardDescription>
              Le slug sera régénéré automatiquement si le nom change.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom (entreprise / structure)</Label>
              <Input
                id="name"
                name="name"
                defaultValue={client.name}
                required
                minLength={2}
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={client.firstName ?? ""}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={client.lastName ?? ""}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={client.email ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={client.phone ?? ""}
                  maxLength={30}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={client.notes ?? ""}
                placeholder="Préférences de contact, horaires, infos diverses…"
                rows={3}
                maxLength={5000}
              />
            </div>
            {state.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="max-w-lg border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
          <CardDescription>
            Supprimer ce client supprimera également tous ses projets et
            configurations associées.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteButton
            action={boundDeleteAction}
            entityName="le client"
            entityLabel={client.name}
          />
        </CardContent>
      </Card>
    </div>
  );
}
