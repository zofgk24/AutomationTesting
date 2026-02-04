import { test, expect } from '@playwright/test';

test.describe('Module Affiliate - Kiểm thử các trường hợp lỗi (Negative Test Cases)', () => {

  const EXISTING_USER = { email: 'xinh1@gmail.com', pass: '123456' };

  // PHẦN 1: KIỂM TRA VALIDATION
  test.describe('Group 1: Edit Affiliate Information Errors', () => {

    test.beforeEach(async ({ page }) => {
      // 1. Đăng nhập
      await page.goto('http://localhost:8080/shop/');
      await page.getByRole('link', { name: ' My Account ' }).click();
      await page.getByRole('link', { name: 'Login' }).click();
      await page.getByRole('textbox', { name: 'E-Mail Address' }).fill(EXISTING_USER.email);
      await page.getByRole('textbox', { name: 'Password' }).fill(EXISTING_USER.pass);
      await page.getByRole('button', { name: 'Login' }).click();
      
      // 2. Vào trang Edit Affiliate
      await page.getByRole('link', { name: 'Edit your affiliate' }).click();
    });

    // TC_AFL_005: Kiểm tra validation trường PayPal Email Account
    test('TC_AFL_005: Báo lỗi khi nhập sai định dạng PayPal Email', async ({ page }) => {
      // 1. Chọn PayPal
      await page.getByRole('radio', { name: 'PayPal' }).check();
      
      const payPalInput = page.getByRole('textbox', { name: '* PayPal Email Account' });

      const invalidEmails = ['thuylt', 'thuylt@', 'thuylt@gmail', 'paypal@gmail.'];

      for (const email of invalidEmails) {
        console.log(`Đang kiểm tra PayPal Email: "${email}"`);

        // 2. Nhập email sai
        await payPalInput.fill(email);

        // 3. Bấm Continue
        await page.getByRole('button', { name: 'Continue' }).click();

        // 4. KIỂM TRA LỖI
        // Kiểm tra xem có Popup trình duyệt không?
        const validationMessage = await payPalInput.evaluate((el) => {
            return (el as HTMLInputElement).validationMessage;
        });

        if (validationMessage) {
            console.log(`-> Pass: Trình duyệt chặn: "${validationMessage}"`);
            expect(validationMessage).not.toBe('');
        } else {
            // Nếu không có Popup, Web phải hiện chữ đỏ
            const errorText = page.getByText('PayPal Email Address does not appear to be valid!');
            
            try {
                await errorText.waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
            }

            if (await errorText.isVisible()) {
                console.log('-> Pass: Web hiện thông báo lỗi đỏ.');
                await expect(errorText).toBeVisible();
            } else {
                throw new Error(`FAIL: Hệ thống chấp nhận email sai: "${email}" (Không thấy lỗi đỏ hay popup)`);
            }
        }
        
        // Xóa input để test case tiếp theo
        await payPalInput.fill('');
      }
    });

    // TC_AFL_007: Validation Cheque
    test('TC_AFL_007: Báo lỗi khi bỏ trống Cheque Payee Name', async ({ page }) => {
      await page.getByRole('radio', { name: 'Cheque' }).check();
      await page.getByRole('textbox', { name: '* Cheque Payee Name' }).fill('');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Cheque Payee Name required!')).toBeVisible();
    });

    // TC_AFL_008: Validation PayPal
    test('TC_AFL_008: Báo lỗi khi bỏ trống PayPal Email', async ({ page }) => {
      // 1. Chọn PayPal
      await page.getByRole('radio', { name: 'PayPal' }).check();
      
      // 2. Xóa trống trường Email
      await page.getByRole('textbox', { name: '* PayPal Email Account' }).fill('');
      
      // 3. Bấm Continue
      await page.getByRole('button', { name: 'Continue' }).click();

      // 4. Verify ER-1: Thông báo lỗi phải hiển thị
      const payPalInput = page.getByRole('textbox', { name: '* PayPal Email Account' });
      const validationMessage = await payPalInput.evaluate(el => (el as HTMLInputElement).validationMessage);

      if (validationMessage) {
          console.log('Pass TC 008: Browser chặn việc bỏ trống.');
          expect(validationMessage).not.toBe('');
      } else {
          console.log('Pass TC 008: Web hiện lỗi đỏ.');
          await expect(page.getByText('PayPal Email Address does not appear to be valid!')).toBeVisible();
      }
    });

    // TC_AFL_009: Validation Bank Transfer
    test('TC_AFL_009: Báo lỗi khi bỏ trống Account Name và Number (Bank Transfer)', async ({ page }) => {
      // 1. Chọn Bank Transfer
      await page.getByRole('radio', { name: 'Bank Transfer' }).check();
      
      // 2. Xóa trống các trường bắt buộc
      await page.getByRole('textbox', { name: '* Account Name' }).fill('');
      await page.getByRole('textbox', { name: '* Account Number' }).fill('');
      
      // 3. Bấm Continue
      await page.getByRole('button', { name: 'Continue' }).click();

      // 4. Verify ER-1: Cả 2 thông báo lỗi phải cùng hiển thị
      console.log('Checking: Account Name required!');
      await expect(page.getByText('Account Name required!')).toBeVisible();
      
      console.log('Checking: Account Number required!');
      await expect(page.getByText('Account Number required!')).toBeVisible();
    });

  });

  // PHẦN 2: KIỂM TRA LỖI KHI ĐĂNG KÝ MỚI (REGISTER)
  test.describe('Group 2: Registration Errors', () => {

    // TC_AFL_012: Trùng Email
    test('TC_AFL_012: Báo lỗi khi đăng ký với Email đã tồn tại', async ({ page }) => {
    await page.goto('http://localhost:8080/shop/index.php?route=account/register');

    await page.getByRole('textbox', { name: '* First Name' }).fill('Duplicate');
    await page.getByRole('textbox', { name: '* Last Name' }).fill('User');
    
    await page.locator('input[name="email"]').fill(EXISTING_USER.email);
    
    await page.getByRole('textbox', { name: '* Password' }).fill('123456');

    await page.locator('input[name="agree"][type="checkbox"]').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Verify
    await expect(page.locator('.alert-danger')).toContainText('Warning: E-Mail Address is already registered!');
    });
    
    // TC_AFL_013: Sai định dạng Email
    test('TC_AFL_013: Báo lỗi khi nhập Email sai định dạng (Affiliate Register)', async ({ page }) => {

    const invalidEmails = ['thuylt', 'thuylt@', 'thuylt@gmail', 'thuylt@gmail.'];

    for (const email of invalidEmails) {

      console.log(`Đang kiểm tra email: "${email}"`);

      // 1. Vào đúng Affiliate Register flow
      await page.goto('http://localhost:8080/shop/');
      await page.getByRole('link', { name: 'Affiliate' }).click();
      await page.getByRole('link', { name: 'Continue' }).click();

      const emailInput = page.getByRole('textbox', { name: '* E-Mail' });
      await emailInput.fill(email);

      await page.getByRole('button', { name: 'Continue' }).click();

      // 2. Browser validation
      const validationMessage = await emailInput.evaluate(
      el => (el as HTMLInputElement).validationMessage
      );

      if (validationMessage) {
      console.log(`-> Browser Check OK: "${validationMessage}"`);
      expect(validationMessage).not.toBe('');
      } else {
      // 3. Affiliate-side validation
      const errorText = page.getByText('E-Mail Address does not appear to be valid!');
      await expect(errorText).toBeVisible();
      console.log('-> Affiliate validation message displayed');
      }
    }
    });
  });
});