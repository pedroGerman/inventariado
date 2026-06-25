import { CustomerForm } from "@/components/clientes/CustomerForm";

export default function NuevoProveedorPage({
  searchParams,
}: {
  searchParams?: { returnTo?: string; openSupplierDrawer?: string };
}) {
  const returnTo =
    searchParams?.returnTo?.startsWith("/") &&
    !searchParams.returnTo.startsWith("//")
      ? searchParams.returnTo
      : undefined;

  return (
    <CustomerForm
      mode="supplier"
      backHref={returnTo ?? "/opciones/clientes"}
      returnTo={returnTo}
      openDrawerOnReturn={searchParams?.openSupplierDrawer === "1"}
    />
  );
}
