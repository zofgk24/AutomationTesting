import { test, expect } from '@playwright/test';

test.describe('Module Affiliate - Happy Paths', () => {

  const EXISTING_USER = { email: 'xinh1@gmail.com', pass: '123456' };

  // PHẦN 1: NGƯỜI DÙNG CÓ SẴN (EXISTING USER) - EDIT INFO
  test.describe('Group 1: Existing User - Cập nhật thông tin', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:8080/shop/');
      await page.getByRole('link', { name: ' My Account ' }).click();
      await page.getByRole('link', { name: 'Login' }).click();
      await page.getByRole('textbox', { name: 'E-Mail Address' }).fill(EXISTING_USER.email);
      await page.getByRole('textbox', { name: 'Password' }).fill(EXISTING_USER.pass);
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Vào trang Edit Affiliate
      await page.getByRole('link', { name: 'Edit your affiliate' }).click();
    });

    // TC_AFL_001 & 003: Cập nhật Cheque (Chỉ nhập trường bắt buộc)
    test('TC_AFL_001 & 003: Cập nhật Cheque (Chỉ nhập trường bắt buộc)', async ({ page }) => {
      // Chỉ nhập Cheque Payee Name, xóa các trường không bắt buộc
      await page.getByRole('textbox', { name: 'Company' }).fill('');
      await page.getByRole('textbox', { name: 'Web Site' }).fill('');
      await page.getByRole('textbox', { name: 'Tax ID' }).fill('');

      await page.getByRole('radio', { name: 'Cheque' }).check();
      await page.getByRole('textbox', { name: '* Cheque Payee Name' }).fill('Xinh Tran Basic');
      
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.locator('.alert-success')).toContainText('Success');
    });

    // TC_AFL_002: Cập nhật Cheque (FULL thông tin)
    test('TC_AFL_002: Cập nhật Cheque (FULL thông tin: Company, Web, Tax)', async ({ page }) => {
      // Yêu cầu: Nhập đầy đủ Company, Website, Tax ID
      await page.getByRole('textbox', { name: 'Company' }).fill('UEL Corp');
      await page.getByRole('textbox', { name: 'Web Site' }).fill('https://uel.edu.vn');
      await page.getByRole('textbox', { name: 'Tax ID' }).fill('TAX-999999');

      await page.getByRole('radio', { name: 'Cheque' }).check();
      await page.getByRole('textbox', { name: '* Cheque Payee Name' }).fill('Xinh Tran Full');

      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.locator('.alert-success')).toContainText('Success');
    });

    // TC_AFL_004: Cập nhật PayPal (Nhập Email)
    test('TC_AFL_004: Cập nhật PayPal (Nhập Email)', async ({ page }) => {
      await page.getByRole('radio', { name: 'PayPal' }).check();
      await page.getByRole('textbox', { name: '* PayPal Email Account' }).fill('paypal_full@test.com');
      
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.locator('.alert-success')).toContainText('Success');
    });

    // TC_AFL_006: Cập nhật Bank Transfer (FULL thông tin chi tiết)
    test('TC_AFL_006: Cập nhật Bank Transfer (FULL thông tin chi tiết)', async ({ page }) => {
      await page.getByRole('radio', { name: 'Bank Transfer' }).check();

      await page.getByRole('textbox', { name: 'Bank Name' }).fill('Vietcombank');
      await page.getByRole('textbox', { name: 'ABA/BSB number' }).fill('BRANCH-001'); // Branch Number
      await page.getByRole('textbox', { name: 'SWIFT Code' }).fill('VCB-VN-SWIFT');
      await page.getByRole('textbox', { name: '* Account Name' }).fill('Tran Nhat Quy Xinh');
      await page.getByRole('textbox', { name: '* Account Number' }).fill('888899990000');

      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.locator('.alert-success')).toContainText('Success');
    });
  });

  // PHẦN 2: NGƯỜI DÙNG MỚI (NEW USER): TẠO TK -> ĐK AFFILIATE
  test.describe('Group 2: New User - Tạo tài khoản mới & Đăng ký Affiliate', () => {

    // TC_AFL_010: Tạo TK mới -> ĐK Affiliate (Chỉ nhập bắt buộc - Cheque)
    test('TC_AFL_010: Tạo TK mới -> ĐK Affiliate (Chỉ nhập bắt buộc - Cheque)', async ({ page }) => {
      const email = `new_user_basic_${Date.now()}@test.com`;
      
      // 1. Đăng ký tài khoản User mới
      await page.goto('http://localhost:8080/shop/index.php?route=account/register');
      await page.getByRole('textbox', { name: '* First Name' }).fill('New');
      await page.getByRole('textbox', { name: '* Last Name' }).fill('User');
      await page.getByRole('textbox', { name: '* E-Mail' }).fill(email);
      await page.getByRole('textbox', { name: '* Password' }).fill('123456');
      
      await page.locator('input[name="agree"][type="checkbox"]').check();
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Vào My Account
      await page.getByRole('link', { name: 'Continue' }).click();

      // 2. Đăng ký Affiliate
      await page.getByRole('link', { name: 'Register for an affiliate' }).click();
      
      // Chọn Cheque
      await page.getByRole('radio', { name: 'Cheque' }).check();
      await page.getByRole('textbox', { name: '* Cheque Payee Name' }).fill('New User Payee');
      
      await page.locator('input[name="agree"][type="checkbox"]').check(); 
      
      await page.getByRole('button', { name: 'Continue' }).click();

      // Verify
      await expect(page.locator('.alert-success')).toContainText('Success');
    });

    // TC_AFL_011: Tạo TK mới -> ĐK Affiliate (FULL thông tin - Cheque)
    test('TC_AFL_011: Tạo TK mới -> ĐK Affiliate (FULL thông tin - Cheque)', async ({ page }) => {
      const email = `new_user_full_${Date.now()}@test.com`;
      
      // 1. Đăng ký tài khoản User mới
      await page.goto('http://localhost:8080/shop/index.php?route=account/register');
      await page.getByRole('textbox', { name: '* First Name' }).fill('Full');
      await page.getByRole('textbox', { name: '* Last Name' }).fill('Option');
      await page.getByRole('textbox', { name: '* E-Mail' }).fill(email);
      await page.getByRole('textbox', { name: '* Password' }).fill('123456');
      
      await page.locator('input[name="agree"][type="checkbox"]').check();
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Vào My Account
      await page.getByRole('link', { name: 'Continue' }).click();

      // 2. Đăng ký Affiliate (FULL OPTION)
      await page.getByRole('link', { name: 'Register for an affiliate' }).click();
      
      // Nhập thông tin bổ sung
      await page.getByRole('textbox', { name: 'Company' }).fill('Full Option Co.');
      await page.getByRole('textbox', { name: 'Web Site' }).fill('https://fulloption.com');
      await page.getByRole('textbox', { name: 'Tax ID' }).fill('TAX-FULL-11');
      
      // Chọn CHEQUE
      await page.getByRole('radio', { name: 'Cheque' }).check();
      await page.getByRole('textbox', { name: '* Cheque Payee Name' }).fill('Full Option Payee');

      await page.locator('input[name="agree"][type="checkbox"]').check();
      
      await page.getByRole('button', { name: 'Continue' }).click();

      // Verify
      await expect(page.locator('.alert-success')).toContainText('Success');
    });
  });

  // PHẦN 3: VERIFICATION 
  test.describe('Group 3: Verification', () => {
    
    // TC_AFL_014: Chưa đăng nhập -> Click Footer Affiliate -> Chuyển hướng Login
    test('TC_AFL_014: Chưa đăng nhập -> Click Footer Affiliate -> Chuyển hướng Login', async ({ page }) => {
      // 1. Mở trang chủ (Chưa đăng nhập)
      await page.goto('http://localhost:8080/shop/');

      // 2. Click vào link "Affiliate" ở FOOTER
      await page.locator('footer').getByRole('link', { name: 'Affiliate' }).click();

      // 3. VERIFY: Kiểm tra URL phải chứa 'account/login'
      await expect(page).toHaveURL(/account\/login/);
    });

    // TC_AFL_015: Đăng nhập vào Ứng dụng với tư cách Người dùng chưa đăng ký là Affiliate
    test('TC_AFL_015: Đăng nhập vào Ứng dụng với tư cách Người dùng chưa đăng ký là Affiliate', async ({ page }) => {
      // 1. Tạo tài khoản User mới
      const newEmail = `user_check_empty_${Date.now()}@test.com`;
      
      await page.goto('http://localhost:8080/shop/index.php?route=account/register');
      await page.getByRole('textbox', { name: '* First Name' }).fill('Check');
      await page.getByRole('textbox', { name: '* Last Name' }).fill('Empty');
      await page.locator('input[name="email"]').fill(newEmail);
      await page.getByRole('textbox', { name: '* Password' }).fill('123456');
      
      await page.locator('input[name="agree"][type="checkbox"]').check();
      await page.getByRole('button', { name: 'Continue' }).click();

      // 2. Log out
      await page.getByRole('link', { name: 'Logout', exact: true }).click();
      await page.getByRole('link', { name: 'Continue' }).click();

      // 3. Bấm link Affiliate ở Footer
      await page.locator('footer').getByRole('link', { name: 'Affiliate' }).click();

      // 4. Login với user mới tạo
      await page.getByRole('textbox', { name: 'E-Mail Address' }).fill(newEmail);
      await page.getByRole('textbox', { name: 'Password' }).fill('123456');
      await page.getByRole('button', { name: 'Login' }).click();

      // 5. CHECK: Phải vào được trang Affiliate với các field trống
      await expect(page).toHaveURL(/account\/affiliate/);

      await expect(page.getByRole('textbox', { name: 'Company' })).toBeEmpty();
      await expect(page.getByRole('textbox', { name: 'Web Site' })).toBeEmpty();
      await expect(page.getByRole('textbox', { name: 'Tax ID' })).toBeEmpty();
      await expect(page.getByRole('textbox', { name: '* Cheque Payee Name' })).toBeEmpty();
    });

    // TC_AFL_016: Tài khoản ĐÃ CÓ Affiliate -> Check dữ liệu ĐÃ LƯU
    test('TC_AFL_016: User cũ đăng nhập từ Footer -> Kiểm tra dữ liệu đã lưu', async ({ page }) => {
      // 1. Vào trang chủ
      await page.goto('http://localhost:8080/shop/');
      
      // 2. Click Footer Affiliate
      await page.locator('footer').getByRole('link', { name: 'Affiliate' }).click();
      
      // 3. Đăng nhập bằng tài khoản có sẵn
      await page.getByRole('textbox', { name: 'E-Mail Address' }).fill(EXISTING_USER.email);
      await page.getByRole('textbox', { name: 'Password' }).fill(EXISTING_USER.pass);
      await page.getByRole('button', { name: 'Login' }).click();

      // 4. Verify URL
      await expect(page).toHaveURL(/account\/affiliate/);
      await page.getByRole('radio', { name: 'Cheque' }).check();

      // 5.Verify field
      const payeeInput = page.getByRole('textbox', { name: '* Cheque Payee Name' });
      await expect(payeeInput).toBeVisible();
      await expect(payeeInput).not.toBeEmpty();
    });

    // TC_AFL_017: Xác nhận liên kết Affiliate hoạt động đúng
    test('TC_AFL_017: Xác nhận liên kết Affiliate hoạt động đúng', async ({ page }) => {
      await page.goto('http://localhost:8080/shop/');

      await page.getByRole('link', { name: ' My Account ' }).click();
      await page.getByRole('link', { name: 'Login' }).click();

      await page.getByRole('textbox', { name: 'E-Mail Address' }).fill('xinh1@gmail.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('123456');
      await page.getByRole('button', { name: 'Login' }).click();

      // Assert login success
      await expect(page).toHaveURL(/route=account\/account/);

      // Vào Affiliate
      await page.getByRole('link', { name: 'Affiliate', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: 'Your Affiliate Information' })
      ).toBeVisible();

      await expect(
        page.getByText('My Affiliate Account')
      ).toBeVisible();
    });
  });

  // PHẦN 4: UPDATE INFO & TRACKING
  test.describe('Group 4: Additional Features', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:8080/shop/index.php?route=account/login');
      await page.getByRole('textbox', { name: 'E-Mail Address' }).fill(EXISTING_USER.email);
      await page.getByRole('textbox', { name: 'Password' }).fill(EXISTING_USER.pass);
      await page.getByRole('button', { name: 'Login' }).click();
    });

    // TC_AFL_022: Chỉnh sửa thông tin
    test('TC_AFL_022: Chỉnh sửa thông tin Affiliate thành công', async ({ page }) => {
      await page.getByRole('link', { name: 'Edit your affiliate' }).click();

      await page.getByRole('textbox', { name: 'Company' }).fill('UEL');
      await page.getByRole('textbox', { name: 'Web Site' }).fill('uel.edu.vn');
      await page.getByRole('textbox', { name: 'Tax ID' }).fill('TAX-9994');
      
      // 1. Chọn Cheque trước
      await page.getByRole('radio', { name: 'Cheque' }).check();

      // 2. Đợi field xuất hiện
      const chequePayeeInput = page.getByRole('textbox', { name: '* Cheque Payee Name' });
      await expect(chequePayeeInput).toBeVisible();

      // 3. Fill luôn, không cần click
      await chequePayeeInput.fill('Xinh Tran Nhat Quy');
      await page.getByRole('button', { name: 'Continue' }).click();

      // Verify: Kiểm tra thông báo thành công
      await expect(page.locator('.alert-success')).toContainText('Success: Your affiliate account has been successfully updated.');
    });

    // TC_AFL_023: Tạo Tracking Code
    test('TC_AFL_023: Tạo và kiểm tra liên kết Affiliate Tracking', async ({ page }) => {
      await page.getByRole('link', { name: 'Custom Affiliate Tracking Code' }).click();

      const trackingCodeInput = page.getByPlaceholder('Your Tracking Code');
      const myCode = await trackingCodeInput.inputValue();
      expect(myCode).not.toBe('');

      // Generator
      await page.getByRole('textbox', { name: 'Tracking Link Generator' }).fill('HTC Touch HD');
      await page.getByRole('link', { name: 'HTC Touch HD' }).click();

      const trackingLinkInput = page.getByRole('textbox', {
        name: 'Tracking Link',
        exact: true
      });

      await expect(trackingLinkInput).not.toHaveValue('');

      const generatedLink = await trackingLinkInput.inputValue();

      // VERIFY
      expect(generatedLink).toContain(`tracking=${myCode}`);
      expect(generatedLink).toContain('route=product/product');

      await page.getByRole('link', { name: 'Continue' }).click();
      await expect(page).toHaveURL(/route=account\/account/);
    });
  });
});