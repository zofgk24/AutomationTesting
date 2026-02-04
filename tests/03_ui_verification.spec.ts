import { test, expect } from '@playwright/test';

test.describe('Module Affiliate - UI Verification & Navigation', () => {

  const EXISTING_USER = { email: 'xinh1@gmail.com', pass: '123456' };

  // ĐĂNG NHẬP
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/shop/index.php?route=account/login');
    await page.getByRole('textbox', { name: 'E-Mail Address' }).fill(EXISTING_USER.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(EXISTING_USER.pass);
    await page.getByRole('button', { name: 'Login' }).click();
  });

  // PHẦN 1: TRANG CHỈNH SỬA THÔNG TIN (EDIT AFFILIATE INFORMATION)
  test.describe('Group 1: Edit Affiliate Information Page UI', () => {

    test.beforeEach(async ({ page }) => {
      await page.getByRole('link', { name: 'Edit your affiliate' }).click();
    });

    // TC_AFL_018: Breadcrumb
    test('TC_AFL_018: Breadcrumb phải hiển thị đúng', async ({ page }) => {
      const breadcrumb = page.locator('.breadcrumb');
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb).toContainText('Affiliate');
    });

    // TC_AFL_019: URL, Heading, Title
    test('TC_AFL_019: Kiểm tra các thành phần UI chính', async ({ page }) => {
      await expect(page).toHaveURL(/route=account\/affiliate/);
      await expect(page).toHaveTitle(/Affiliate/); 
      await expect(page.locator('#content h1, #content h2').first()).toContainText('Your Affiliate Information');
    });

    // TC_AFL_021: Chức năng trang (Browser Back & Continue)
    test('TC_AFL_021: Kiểm tra chức năng điều hướng (Browser Back & Continue)', async ({ page }) => {
      
      // 1. Kiểm tra Browser Back
      await page.goBack();
      
      // Verify: Phải quay về trang My Account
      await expect(page).toHaveURL(/route=account\/account/);
      
      await expect(page.getByRole('heading', { name: 'My Account' }).first()).toBeVisible();
      await expect(page.getByText('My Affiliate Account')).toBeVisible();

      // 2. Vào lại trang để test Continue
      await page.getByRole('link', { name: 'Edit your affiliate' }).click();

      // 3. Kiểm tra nút Continue
      await page.getByRole('textbox', { name: '* Cheque Payee Name' }).fill('Test Navigation');
      await page.getByRole('button', { name: 'Continue' }).click();

      // Verify: Update thành công và về lại My Account
      await expect(page.locator('.alert-success')).toBeVisible();
      await expect(page).toHaveURL(/route=account\/account/);
      // Check lại lần nữa để chắc chắn đã về My Account
      await expect(page.getByText('My Affiliate Account')).toBeVisible();
    });
  });

  // PHẦN 2: TRANG TRACKING (AFFILIATE TRACKING)
  test.describe('Group 2: Affiliate Tracking Page UI', () => {

    test.beforeEach(async ({ page }) => {
      // Vào trang Tracking
      await page.getByRole('link', { name: 'Custom Affiliate Tracking Code' }).click();
    });

    // TC_AFL_024: Breadcrumb
    test('TC_AFL_024: Breadcrumb phải hiển thị đúng', async ({ page }) => {
      const breadcrumb = page.locator('.breadcrumb');
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb).toContainText('Tracking');
    });

    // TC_AFL_025: URL, Heading, Title
    test('TC_AFL_025: Kiểm tra các thành phần UI chính', async ({ page }) => {
      await expect(page).toHaveURL(/route=account\/tracking/);
      await expect(page).toHaveTitle(/Tracking/);
      await expect(page.getByRole('heading', { name: 'Affiliate Tracking' })).toBeVisible();
    });

    // TC_AFL_027: Chức năng trang (Browser Back & Continue)
    test('TC_AFL_027: Kiểm tra chức năng trang Tracking (Browser Back & Continue)', async ({ page }) => {
      
      // 1. Kiểm tra Browser Back
      await page.goBack();
      
      await expect(page).toHaveURL(/route=account\/account/);
      await expect(page.getByText('My Affiliate Account')).toBeVisible();

      // 2. Vào lại trang để test Continue
      await page.getByRole('link', { name: 'Custom Affiliate Tracking Code' }).click();

      // 3. Kiểm tra nút Continue
      await page.getByRole('textbox', { name: 'Tracking Link Generator' }).fill('HTC Touch HD');
      await page.getByRole('link', { name: 'HTC Touch HD' }).click();

      await page.getByRole('link', { name: 'Continue' }).click();

      // Verify: Về lại My Account
      await expect(page).toHaveURL(/route=account\/account/);
      await expect(page.getByText('My Affiliate Account')).toBeVisible();
    });
  });
});