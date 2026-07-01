import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const demoBanner = page.getByText("Modo demo");
  const isMock = await demoBanner.isVisible().catch(() => false);

  if (isMock) {
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/");
    return;
  }

  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    test.skip(
      true,
      "Supabase activo: define E2E_EMAIL y E2E_PASSWORD para probar el flujo completo.",
    );
  }

  await page.locator("#email").fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL(/\/(onboarding|$)/, { timeout: 15_000 });

  if (page.url().includes("/onboarding")) {
    test.skip(true, "Usuario sin negocio configurado — completa onboarding primero.");
  }
}

async function resetMockDb(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    localStorage.removeItem("pos-mock-db");
    localStorage.removeItem("pos-cart");
    window.dispatchEvent(new Event("pos-db-updated"));
  });
}

test.describe("Flujo completo POS (producción)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await resetMockDb(page);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("venta con abono parcial → deuda → abonar saldo", async ({ page }) => {
    // 1. Agregar producto al carrito
    await page.goto("/ventas");
    await page.getByText("Coca-Cola 600ml").click();

    // 2. Ir al carrito y continuar a caja
    await page.goto("/ventas/carrito");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL("/ventas/caja");

    // 3. Seleccionar cliente
    await page.getByRole("button", { name: "Agregar cliente" }).click();
    await page.getByRole("button", { name: /Juan Pérez/i }).click();
    await expect(page.getByRole("button", { name: /Juan Pérez/i })).toBeVisible();

    // 4. Modo abonar + efectivo
    await page.getByRole("radio", { name: "Abonar" }).click();
    await page.getByRole("radio", { name: "Efectivo" }).click();

    // 5. Confirmar pago parcial (50 de 75)
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Confirmar pago")).toBeVisible();
    await page.getByLabel("Abonas ahora").fill("50");
    await page.getByRole("button", { name: "FINALIZAR" }).click();

    // 6. Debe redirigir a detalle de deuda
    await page.waitForURL(/\/deudas\//);
    await expect(page.getByRole("button", { name: "Cobrar todo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Abonar" })).toBeVisible();

    // 7. Abonar resto del saldo
    await page.getByRole("button", { name: "Abonar" }).click();
    await expect(page.getByRole("heading", { name: "Abonar" })).toBeVisible();
    await page.getByLabel("Abonas").fill("25");
    await page.getByRole("button", { name: "Aceptar" }).click();

    // 8. Deuda saldada
    await expect(page.getByText("Total Deuda").locator("..")).toContainText("0");
  });

  test("venta pagada completa → orden de venta", async ({ page }) => {
    await page.goto("/ventas");
    await page.getByText("Coca-Cola 600ml").click();
    await page.goto("/ventas/caja");

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Confirmar pago")).toBeVisible();
    await page.getByRole("button", { name: "FINALIZAR" }).click();

    await page.waitForURL(/\/ordenes\//);
    await expect(page.getByText("Confirmada")).toBeVisible();
  });

  test("compra a proveedor → orden de compra", async ({ page }) => {
    await page.goto("/compras");
    await page.getByText("Bolsas plásticas").click();

    await page.goto("/compras/caja");
    await page.getByRole("button", { name: "FINALIZAR" }).click();
    await page.getByRole("button", { name: "FINALIZAR" }).click();

    await page.waitForURL(/\/compras\/ordenes/);
  });

  test("dashboard muestra productos más vendidos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Más vendidos")).toBeVisible();
  });
});
