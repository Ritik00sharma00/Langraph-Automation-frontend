import { test, expect } from '@playwright/test'

test('fills and submits HCP interaction form', async ({ page }) => {
  await page.goto('/')

  await page.fill('input[name=hcpName]', 'Dr. Smith')
  await page.selectOption('select[name=interactionType]', 'Meeting')
  await page.fill('input[name=date]', '2026-07-15')
  await page.fill('input[name=time]', '13:30')
  await page.fill('input[name=attendees]', 'Dr. Smith, Jane Doe')
  await page.fill('textarea[name=topics]', 'Product efficacy and launch timeline')
  await page.check('input[name=sentiment][value=Positive]')
  await page.fill('textarea[name=outcomes]', 'Agreed to follow-up demo')
  await page.fill('textarea[name=followUps]', 'Send pricing deck')

  await page.click('button:has-text("Send")')
  await expect(page.locator('.assistant-box')).toContainText('Assistant')

  await page.click('button:has-text("Log Interaction")')
  await expect(page.locator('text=Interaction logged successfully')).toBeVisible()
})
