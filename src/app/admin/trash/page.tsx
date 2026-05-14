import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTrashPage({ searchParams }: PageProps) {
  const sParams = await searchParams;
  const params = new URLSearchParams();

  Object.entries(sParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (value) {
      params.set(key, value);
    }
  });

  params.set("trash", "1");
  redirect(`/admin/dashboard?${params.toString()}`);
}
