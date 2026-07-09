"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TextField } from "@/components/ui/Input";
import { DateFilterPicker } from "@/components/ui/DateFilterPicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedbackListIcon } from "@/components/feedback/FeedbackListIcon";
import {
  FeedbackStatusFilterButton,
  FeedbackStatusFilterPills,
} from "@/components/feedback/FeedbackStatusFilter";
import { listFeedbackForAdmin } from "@/lib/feedback/actions";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import {
  matchesDateFilter,
  sortDateKeysDesc,
  type DateFilterValue,
} from "@/lib/utils/calendarPicker";
import {
  getFeedbackStatusLabel,
  matchesFeedbackStatusFilter,
} from "@/lib/utils/feedbackStatusFilter";
import type { UserFeedback } from "@/lib/types/database";

function getSenderLabel(item: UserFeedback): string {
  return (
    item.sender_name?.trim() ||
    item.sender_email?.trim() ||
    "Usuario anónimo"
  );
}

function matchesSearch(item: UserFeedback, query: string): boolean {
  if (!query) return true;
  const haystack = [
    item.sender_name,
    item.sender_email,
    item.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function FeedbackAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState<DateFilterValue>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await listFeedbackForAdmin();
      if (cancelled) return;

      if (result.error) {
        setError(result.error);
        if (result.error.includes("permiso")) {
          router.replace("/opciones");
        }
      } else {
        setItems(result.items ?? []);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (!matchesFeedbackStatusFilter(item.status, statusFilters)) {
        return false;
      }
      const dateISO = item.created_at.split("T")[0];
      if (!matchesDateFilter(dateISO, filterDate)) return false;
      return matchesSearch(item, query);
    });
  }, [items, statusFilters, filterDate, query]);

  const groupedEntries = useMemo(() => {
    const grouped = filtered.reduce<Record<string, UserFeedback[]>>(
      (acc, item) => {
        const date = item.created_at.split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      },
      {},
    );

    return sortDateKeysDesc(Object.keys(grouped)).map(
      (date) =>
        [
          date,
          grouped[date].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        ] as const,
    );
  }, [filtered]);

  const emptyTitle = useMemo(() => {
    if (statusFilters.size === 1) {
      const label = getFeedbackStatusLabel(
        Array.from(statusFilters)[0],
      ).toLowerCase();
      return `No hay comentarios ${label}s`;
    }
    if (statusFilters.size > 1 || query || filterDate) {
      return "No hay comentarios con esos filtros";
    }
    return "Sin comentarios";
  }, [statusFilters, query, filterDate]);

  const emptyDescription = useMemo(() => {
    if (statusFilters.size > 0 || query || filterDate) {
      return "Prueba con otro criterio o limpia los filtros para ver todo.";
    }
    return "Cuando alguien envíe feedback, aparecerá aquí.";
  }, [statusFilters.size, query, filterDate]);

  return (
    <>
      <Header title="Sugerencias recibidas" showBack backHref="/opciones" />

      <div className="flex flex-col gap-6 px-3 py-3">
        <div className="flex flex-col gap-3">
          <TextField
            type="text"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            className="placeholder:text-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar"
          />

          <FeedbackStatusFilterPills
            selected={statusFilters}
            onChange={setStatusFilters}
          />

          <div className="flex items-stretch gap-2">
            <DateFilterPicker
              value={filterDate}
              onChange={setFilterDate}
              className="min-w-0 flex-1"
            />
            <FeedbackStatusFilterButton
              selected={statusFilters}
              onChange={setStatusFilters}
            />
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cargando comentarios...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-danger">{error}</p>
        ) : (
          <>
            {groupedEntries.map(([date, dateItems]) => (
              <div key={date} className="flex flex-col gap-1">
                <h2 className="mb-2 text-sm font-semibold capitalize text-slate-500">
                  {formatDateGroup(date)}
                </h2>
                <div className="flex flex-col divide-y divide-slate-200">
                  {dateItems.map((item) => (
                    <div key={item.id} className="gap-0 py-4">
                      <Link
                        href={`/opciones/feedback/admin/${item.id}`}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <FeedbackListIcon status={item.status} />

                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm text-card-foreground">
                            {getSenderLabel(item)}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {item.message}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs text-slate-500">
                          {formatTime(item.created_at)}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading && !error && (
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
