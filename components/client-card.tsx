import Link from "next/link";
import type { Client } from "@prisma/client";

export default function ClientCard({ client }: { client: Client }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {client.niche} • {client.country}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
          Cliente
        </span>
      </div>
      {client.instagramHandle && (
        <p className="mt-4 text-sm text-slate-500">
          Instagram: @{client.instagramHandle.replace(/^@/, "")}
        </p>
      )}
      {client.notes && <p className="mt-2 text-sm text-slate-500">{client.notes}</p>}
      <Link
        href={`/clients/${client.id}/board`}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        Entrar no board
      </Link>
    </div>
  );
}
