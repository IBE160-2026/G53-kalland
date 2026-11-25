import { expect, test, type Page } from "@playwright/test";
import { fixtureClients, fixtureUsers } from "../../src/db/seed/fixture.ts";
import { loginAs } from "./helpers.ts";

// Story 2.1: staff create and manage clients (FR-1, FR-5, S2).
function sidebar(page: Page) {
  return page.getByRole("complementary", { name: "Client list" });
}

test("staff add a client, which opens and is listed first", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Clients" }).click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Clients" })).toHaveAttribute("aria-current", "page");

  await sidebar(page).getByRole("link", { name: "Add client" }).click();
  const name = `Bergen Bryggeri ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Org number (optional)").fill("921 456 786");
  await page.getByLabel("Billing email").fill("faktura@bryggeri.example");
  await page.getByLabel("Account manager").selectOption({ label: fixtureUsers.per.name });
  await page.getByLabel("Staff notes (optional)").fill("Prefers photos with people in them.");
  await page.getByRole("button", { name: "Save client" }).click();

  await expect(page).toHaveURL(/\/clients\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  const main = page.getByRole("main");
  await expect(main.getByText("Active", { exact: true })).toBeVisible();
  await expect(main.getByText("921 456 786")).toBeVisible();
  await expect(main.getByText(fixtureUsers.per.name)).toBeVisible();
  await expect(main.getByText("Prefers photos with people in them.")).toBeVisible();

  const first = sidebar(page).getByRole("listitem").first();
  await expect(first).toContainText(name);
  await expect(first).toContainText("No contacts");
  await expect(first.getByRole("link")).toHaveAttribute("aria-current", "true");
  await expect(main.getByRole("button", { name: /delete|remove/i })).toHaveCount(0);
});

test("an invalid org number and billing email show inline errors, keep the values and save nothing", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/clients/new");
  const name = `Invalid Org ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Org number (optional)").fill("123456789");
  await page.getByLabel("Billing email").fill("foo@");
  await page.getByRole("button", { name: "Save client" }).click();

  await expect(page.getByText("Enter a valid org number: nine digits, for example 921 456 786.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address, for example faktura@example.com.")).toBeVisible();
  await expect(page.getByLabel("Org number (optional)")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Name")).toHaveValue(name);
  await expect(page.getByLabel("Org number (optional)")).toHaveValue("123456789");
  await expect(page).toHaveURL(/\/clients\/new$/);
  await expect(sidebar(page)).not.toContainText(name);
});

test("setting a client inactive refuses its logged-in contact; setting it active lets them log in", async ({ page, browser }) => {
  const contact = await browser.newPage();
  await loginAs(contact, fixtureUsers.emil);

  await loginAs(page, fixtureUsers.ida);
  await page.goto("/clients");
  await sidebar(page).getByRole("link", { name: new RegExp(fixtureClients.nordlys.name) }).click();
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Set inactive" }).click();
  try {
    await expect(main.getByText("Inactive", { exact: true })).toBeVisible();
    await expect(sidebar(page).getByRole("listitem").filter({ hasText: fixtureClients.nordlys.name })).toContainText("Inactive");
    await contact.reload();
    await expect(contact).toHaveURL(/\/login\?reason=inactive$/);
    await expect(contact.getByText("Your account is not active. Contact the agency.")).toBeVisible();
  } finally {
    await main.getByRole("button", { name: "Set active" }).click();
    await expect(main.getByText("Active", { exact: true })).toBeVisible();
  }

  await loginAs(contact, fixtureUsers.emil);
  await contact.close();
});

test("an unknown or malformed client id shows Not found", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  for (const id of [crypto.randomUUID(), "not-a-uuid"]) {
    const response = await page.goto(`/clients/${id}`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  }
});

test("Edit client shows the stored values and saves a changed note", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/clients/new");
  const name = `Edit Test ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Org number (optional)").fill("921456786");
  await page.getByLabel("Billing email").fill("faktura@edit.example");
  await page.getByLabel("Account manager").selectOption({ label: fixtureUsers.per.name });
  await page.getByRole("button", { name: "Save client" }).click();
  await expect(page).toHaveURL(/\/clients\/[0-9a-f-]{36}$/);
  const clientUrl = page.url();

  await page.getByRole("main").getByRole("link", { name: "Edit client" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.getByLabel("Name")).toHaveValue(name);
  await expect(page.getByLabel("Org number (optional)")).toHaveValue("921456786");
  await expect(page.getByLabel("Billing email")).toHaveValue("faktura@edit.example");
  await expect(page.getByLabel("Account manager").locator("option:checked")).toHaveText(fixtureUsers.per.name);
  await page.getByLabel("Staff notes (optional)").fill("Campaign moved to January.");
  await page.getByRole("button", { name: "Save client" }).click();

  await expect(page).toHaveURL(clientUrl);
  await expect(page.getByRole("main").getByText("Campaign moved to January.")).toBeVisible();
});

test("a contact gets 403 on the Clients tab", async ({ page }) => {
  await loginAs(page, fixtureUsers.jonas);
  const response = await page.goto("/clients");
  expect(response?.status()).toBe(403);
  await expect(page.getByRole("heading", { name: "No access" })).toBeVisible();
  await expect(page.getByText(fixtureClients.nordlys.name)).toHaveCount(0);
});

// Story 2.2: staff add and manage contacts (FR-2, FR-5, S1).
async function addClient(page: Page, name: string) {
  await page.goto("/clients/new");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Billing email").fill("faktura@contacts.example");
  await page.getByLabel("Account manager").selectOption({ label: fixtureUsers.ida.name });
  await page.getByRole("button", { name: "Save client" }).click();
  await expect(page).toHaveURL(/\/clients\/[0-9a-f-]{36}$/);
}

test("staff add a contact, who is listed under the client and counted in the sidebar", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  const name = `Contact Test ${Date.now()}`;
  await addClient(page, name);
  const clientUrl = page.url();
  const main = page.getByRole("main");
  await expect(main.getByText("This client has no contacts yet.")).toBeVisible();

  await main.getByRole("link", { name: "Add contact" }).click();
  await expect(page).toHaveURL(/\/contacts\/new$/);
  const email = `nora-${Date.now()}@contacts.example`;
  await page.getByLabel("Name").fill("Nora Dahl");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Phone (optional)").fill("+47 912 34 567");
  await page.getByRole("button", { name: "Save contact" }).click();

  await expect(page).toHaveURL(clientUrl);
  const row = main.getByRole("listitem").filter({ hasText: "Nora Dahl" });
  await expect(row).toContainText(`${email}, +47 912 34 567`);
  await expect(row.getByText("Active", { exact: true })).toBeVisible();
  await expect(row.getByRole("link", { name: "Edit Nora Dahl" })).toBeVisible();
  await expect(row.getByRole("button", { name: "Deactivate Nora Dahl" })).toBeVisible();
  await expect(main.getByRole("button", { name: /delete|remove/i })).toHaveCount(0);
  await expect(sidebar(page).getByRole("listitem").filter({ hasText: name })).toContainText("1 contact");

  await row.getByRole("link", { name: "Edit Nora Dahl" }).click();
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await page.getByLabel("Name").fill("Nora Dahl-Berg");
  await page.getByRole("button", { name: "Save contact" }).click();
  await expect(page).toHaveURL(clientUrl);
  await expect(main.getByText("Nora Dahl-Berg")).toBeVisible();
});

test("a duplicate email shows an inline error, keeps the values and saves nothing", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await addClient(page, `Duplicate Test ${Date.now()}`);
  const clientUrl = page.url();
  await page.goto(`${clientUrl}/contacts/new`);
  await page.getByLabel("Name").fill("Copy of Ida");
  await page.getByLabel("Email").fill(`  ${fixtureUsers.ida.email.toUpperCase()} `);
  await page.getByRole("button", { name: "Save contact" }).click();

  await expect(page.getByText("This email is already used by another user.")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Name")).toHaveValue("Copy of Ida");
  await expect(page).toHaveURL(/\/contacts\/new$/);
  await page.goto(clientUrl);
  await expect(page.getByRole("main").getByText("This client has no contacts yet.")).toBeVisible();
});

test("deactivating a logged-in contact refuses them; reactivating lets them log in", async ({ page, browser }) => {
  const contact = await browser.newPage();
  await loginAs(contact, fixtureUsers.emil);

  await loginAs(page, fixtureUsers.ida);
  await page.goto("/clients");
  await sidebar(page).getByRole("link", { name: new RegExp(fixtureClients.nordlys.name) }).click();
  const row = page.getByRole("main").getByRole("listitem").filter({ hasText: fixtureUsers.emil.name });
  await row.getByRole("button", { name: `Deactivate ${fixtureUsers.emil.name}` }).click();
  try {
    await expect(row.getByText("Inactive", { exact: true })).toBeVisible();
    await contact.reload();
    await expect(contact).toHaveURL(/\/login\?reason=inactive$/);
    await expect(contact.getByText("Your account is not active. Contact the agency.")).toBeVisible();
  } finally {
    await row.getByRole("button", { name: `Reactivate ${fixtureUsers.emil.name}` }).click();
    await expect(row.getByText("Active", { exact: true })).toBeVisible();
  }

  await loginAs(contact, fixtureUsers.emil);
  await contact.close();
});

test("a contact page under the wrong client, or with an unknown or malformed id, shows Not found", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/clients");
  await sidebar(page).getByRole("link", { name: new RegExp(fixtureClients.nordlys.name) }).click();
  const nordlysUrl = page.url();
  await sidebar(page).getByRole("link", { name: new RegExp(fixtureClients.fjordkaffe.name) }).click();
  await page.getByRole("main").getByRole("link", { name: `Edit ${fixtureUsers.jonas.name}` }).click();
  await expect(page).toHaveURL(/\/contacts\/[0-9a-f-]{36}\/edit$/);
  await expect(page.getByLabel("Phone (optional)")).toHaveValue("+47 912 34 567");
  const jonasId = /\/contacts\/([0-9a-f-]{36})\/edit$/.exec(page.url())![1];

  for (const path of [`${nordlysUrl}/contacts/${jonasId}/edit`, `${nordlysUrl}/contacts/${crypto.randomUUID()}/edit`, `${nordlysUrl}/contacts/not-a-uuid/edit`]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  }
});
