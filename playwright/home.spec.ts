import { test, expect } from '@playwright/test';
import { generateTraceParent } from '@tracetest/core';
import Tracetest from '@tracetest/core';

const tracetest = Tracetest();

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await tracetest.configure();
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const traceparent = generateTraceParent();

  await page.evaluate(traceparent => {
    const head = document.querySelector('head');
    const meta = document.createElement('meta');

    meta.setAttribute('name', 'traceparent');
    meta.setAttribute('content', traceparent);

    head?.appendChild(meta);
  }, traceparent);
});

test('creates a pokemon', async ({ page }) => {
  expect(await page.getByText('Pokeshop')).toBeTruthy();

  await page.click('text=Add');

  await page.getByLabel('Name').fill('Charizard');
  await page.getByLabel('Type').fill('Flying');
  await page
    .getByLabel('Image URL')
    .fill('https://upload.wikimedia.org/wikipedia/en/1/1f/Pok%C3%A9mon_Charizard_art.png');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
});

test('imports a pokemon', async ({ page }) => {
  expect(await page.getByText('Pokeshop')).toBeTruthy();

  await page.click('text=Import');

  await page.getByLabel('ID').fill(Math.floor(Math.random() * 101).toString());
  await page.getByRole('button', { name: 'OK', exact: true }).click();
});

test('deletes a pokemon', async ({ page }) => {
  await page.locator('[data-cy="pokemon-list"]');

  await page.locator('[data-cy="pokemon-card"]').first().click();
  await page.locator('[data-cy="pokemon-card"]').first().locator('[data-cy="delete-pokemon-button"]').click();
});
