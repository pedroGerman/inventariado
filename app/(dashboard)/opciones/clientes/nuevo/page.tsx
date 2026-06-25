import { CustomerForm } from "@/components/clientes/CustomerForm";

export default function NuevoClientePage({
  searchParams,
}: {
  searchParams?: { returnTo?: string; openCustomerDrawer?: string };
}) {
  const returnTo =
    searchParams?.returnTo?.startsWith("/") &&
    !searchParams.returnTo.startsWith("//")
      ? searchParams.returnTo
      : undefined;

  return (
    <CustomerForm
      mode="customer"
      backHref={returnTo ?? "/opciones/clientes"}
      returnTo={returnTo}
      openDrawerOnReturn={searchParams?.openCustomerDrawer === "1"}
    />
  );
}
