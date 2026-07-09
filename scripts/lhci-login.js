const { generate } = require('otplib');

/**
 * Puppeteer script to authenticate Lighthouse CI before running audits.
 * Uses otplib to generate the 2FA code programmatically.
 * @param {import('puppeteer').Browser} browser
 * @param {{url: string}} context
 */
module.exports = async (browser, context) => {
  const page = await browser.newPage();
  
  console.log('Logging in to application for:', context.url);
  
  try {
    // 1. Navigate to the login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // 2. Wait for the login email input field
    await page.waitForSelector('#login-email', { timeout: 10000 });
    
    // 3. Type credentials
    await page.click('#login-email');
    await page.type('#login-email', 'superadmin@gerpy.local', { delay: 50 });
    await page.click('#login-password');
    await page.type('#login-password', 'GerpyDemo!2026', { delay: 50 });
    
    // 4. Submit first stage
    await page.click('#login-submit');
    
    // 5. Wait for the 2FA code field to appear
    console.log('Waiting for 2FA input field...');
    await page.waitForSelector('#login-2fa-code', { timeout: 10000 });
    
    // 6. Generate the TOTP token using the secret from the database
    const totpCode = await generate({ secret: '2BVEDHYPT6EUZWV4DG7JWUJJO3TIPYJS' });
    console.log('Generated TOTP code:', totpCode);
    
    // 7. Type the 2FA code
    await page.click('#login-2fa-code');
    await page.type('#login-2fa-code', totpCode, { delay: 50 });
    
    // 8. Submit the 2FA form
    await page.click('#login-2fa-form button[type="submit"]');
    
    // 9. Wait for a few seconds to let cookies be set and navigation to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const currentUrl = page.url();
    console.log('Post-login URL is:', currentUrl);
  } catch (err) {
    console.error('Failed to authenticate:', err.message);
  } finally {
    await page.close();
  }
};
