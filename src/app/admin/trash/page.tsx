import { requireAdmin } from "@/lib/auth/admin";
import {
  countBookingsForDashboard,
  listBookingsForDashboard,
} from "@/features/booking/service";
import { BookingRow } from "../dashboard/BookingRow";
import { BookingFilters } from "../dashboard/BookingFilters";
import Link from "next/link";

type PageProps = {
  params: Promise<any>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTrashPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [sParams, _] = await Promise.all([searchParams, params]);
  const currentPage = Number(sParams.page) || 1;
  const statusParam = sParams.status as any;
  const sortParam = (sParams.sort as "asc" | "desc") || "desc";
  const queryParam = sParams.query as string;

  const filters = {
    status: statusParam,
    dateOrder: sortParam,
    query: queryParam,
    page: currentPage,
    pageSize: 20,
    isActive: false, // 휴지통이므로 비활성화된 데이터만
  };

  const [bookings, totalCount] = await Promise.all([
    listBookingsForDashboard(filters),
    countBookingsForDashboard(filters)
  ]);

  const totalPages = Math.ceil(totalCount / 20);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const buildQuery = (newParams: Record<string, string>) => {
    const current = new URLSearchParams();
    if (statusParam) current.set("status", statusParam);
    if (sortParam !== "desc") current.set("sort", sortParam);
    if (queryParam) current.set("query", queryParam);
    Object.entries(newParams).forEach(([k, v]) => current.set(k, v));
    return `/admin/trash?${current.toString()}`;
  };

  const sectionTitleClass = "text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]";

  return (
    <main className="min-h-dvh bg-[#EAE8E4] px-6 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[#D6D5CE] pb-8">
          <div className="space-y-1">
            <p className={sectionTitleClass}>Administration</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Trash
            </h1>
          </div>
        </header>

        <section className="space-y-6">
          <BookingFilters 
            initialQuery={queryParam} 
            initialStatus={statusParam} 
            initialSort={sortParam} 
            baseUrl="/admin/trash"
          />

          {bookings.length === 0 ? (
            <div className="mt-8 rounded-none border border-dashed border-[#D6CAB7] bg-white/50 p-12 text-center text-sm text-[#7C826F]">
              No deleted bookings found.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto border border-[#D9D4C7] bg-white shadow-sm">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-[#D6D5CE] text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">
                  <tr>
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Deposit</th>
                    <th className="px-4 py-4">Final</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D9C9]">
                  {bookings.map((booking) => (
                    <BookingRow 
                      key={booking.id} 
                      booking={booking} 
                      isTrash={true}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-[#D6D5CE] pt-6">
              <span className="text-xs text-[#7C826F]">
                Showing {bookings.length} of {totalCount} bookings
              </span>
              <div className="flex gap-2">
                {pageNumbers.map((p) => (
                  <Link
                    key={p}
                    href={buildQuery({ page: String(p) })}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      p === currentPage
                        ? "bg-[#7C826F] text-white"
                        : "text-[#7C826F] hover:bg-white"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
