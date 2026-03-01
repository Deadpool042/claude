"use client";

import { useActionState } from "react";
import { createClientAction } from "../_actions/create-client";
import { PageLayout } from "@/components/shell/page-layout";
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

export default function NewClientPage() {
  const [state, formAction, isPending] = useActionState(createClientAction, {
    error: null,
  });

  return (
    <PageLayout title="Nouveau client" description="Créer un nouveau client">
      <Card className="max-w-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
            <CardDescription>
              Le slug sera généré automatiquement à partir du nom.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom (entreprise / structure)</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Acme Corporation"
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
                  placeholder="Jean"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Dupont"
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
                  placeholder="contact@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  maxLength={30}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Préférences de contact, horaires, infos diverses…"
                rows={3}
                maxLength={5000}
              />
            </div>
            {state.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Création..." : "Créer le client"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageLayout>
  );
}
