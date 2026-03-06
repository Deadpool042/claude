"use client";

import { useEffect, useState } from "react";
import { Label } from "@/shared/components/ui/label";

interface ClientOption {
  id: string;
  name: string;
}

interface ClientSelectProps {
  defaultClientId: string;
  onChange?: (clientId: string) => void;
}

export function ClientSelect({ defaultClientId, onChange }: ClientSelectProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data: ClientOption[] = await res.json() as ClientOption[];
          setClients(data);
        }
      } finally {
        setLoading(false);
      }
    }
    void fetchClients();
  }, []);

  return (
    <>
      <Label htmlFor="clientId">Client *</Label>
      <select
        id="clientId"
        name="clientId"
        defaultValue={defaultClientId}
        required
        disabled={loading}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
      >
        <option value="">
          {loading ? "Chargement…" : "Sélectionner un client"}
        </option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </>
  );
}
