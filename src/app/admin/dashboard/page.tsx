import { requireAdmin } from "@/lib/auth/admin";
import {
  countBookingsForDashboard,
  listBookingsForDashboard,
} from "@/features/booking/service";
import { BookingRow } from "./BookingRow";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboardPage({ params, searchParams }: any) {
  await requireAdmin();

  const sParams = await searchParams;
  const currentPage = Number(sParams.page) || 1;
  const statusParam = sParams.status as any;
  const sortParam = (sParams.sort as "asc" | "desc") || "desc";
  const queryParam = sParams.query as string;
  const showPast = sParams.past === "1";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filters = {
    status: statusParam,
    dateOrder: sortParam,
    query: queryParam,
    page: currentPage,
    pageSize: 20,
    ...(showPast 
      ? { dateTo: new Date(today.getTime() - 1) } 
      : { dateFrom: today }
    )
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
    if (showPast) current.set("past", "1");
    Object.entries(newParams).forEach(([k, v]) => current.set(k, v));
    return `/admin/dashboard?${current.toString()}`;
  };

  const sectionTitleClass = "text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]";

  return (
    <main className="min-h-dvh bg-[#EAE8E4] px-6 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[#D6D5CE] pb-8">
          <div className="space-y-1">
            <p className={sectionTitleClass}>Administration</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-full border border-[#D6CAB7] bg-white p-1">
              <Link
                href="/admin/dashboard"
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  !showPast ? "bg-[#7C826F] text-white" : "text-[#7C826F] hover:bg-[#EAE8E4]"
                }`}
              >
                Upcoming
              </Link>
              <Link
                href="/admin/dashboard?past=1"
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  showPast ? "bg-[#7C826F] text-white" : "text-[#7C826F] hover:bg-[#EAE8E4]"
                }`}
              >
                Past Events
              </Link>
            </div>
            <Link
              href="/admin/calendar"
              className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white flex items-center gap-2"
            >
              <span>View Calendar</span>
              <svg 
                className="h-3.5 w-3.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </header>

        <section className="space-y-6">
          <form className="flex flex-wrap items-end gap-4">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#7C826F]">
              Search
              <input
                name="query"
                type="text"
                placeholder="Name, email..."
                defaultValue={queryParam}
                className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-sm focus:border-[#7C826F] focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#7C826F]">
              Status
              <select
                name="status"
                defaultValue={statusParam}
                className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CHECKED">Checked</option>
                <option value="DEPOSIT_PAID">Deposit Paid</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#7C826F]">
              Sort
              <select
                name="sort"
                defaultValue={sortParam}
                className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-sm"
              >
                <option value="desc">Date desc</option>
                <option value="asc">Date asc</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full bg-[#7C826F] px-5 py-2 text-xs font-medium text-white transition hover:bg-[#6B7360]"
            >
              Apply Filters
            </button>
            <Link
              href="/admin/dashboard"
              className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white"
            >
              Reset
            </Link>
          </form>

          {bookings.length === 0 ? (
            <div className="mt-8 rounded-none border border-dashed border-[#D6CAB7] bg-white/50 p-12 text-center text-sm text-[#7C826F]">
              No bookings found.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto border border-[#D9D4C7] bg-white shadow-sm">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-[#D6D5CE] text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">
                  <tr>
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
