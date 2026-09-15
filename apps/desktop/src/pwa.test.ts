import { describe, expect, it, vi } from 'vitest';
import { canRegisterPwaServiceWorker, registerPwaServiceWorker } from './pwa';

describe('PWA service worker registration', () => {
  it('registers only for a production browser host', async () => {
    const registration = {} as ServiceWorkerRegistration;
    const register = vi.fn().mockResolvedValue(registration);

    await expect(
      registerPwaServiceWorker({
        isProduction: true,
        isTauriHost: false,
        serviceWorker: { register },
      }),
    ).resolves.toBe(registration);

    expect(register).toHaveBeenCalledWith('/service-worker.js', { scope: '/' });
  });

  it('does not register in development, native hosts, or unsupported browsers', async () => {
    const register = vi.fn();
    for (const environment of [
      { isProduction: false, isTauriHost: false, serviceWorker: { register } },
      { isProduction: true, isTauriHost: true, serviceWorker: { register } },
      { isProduction: true, isTauriHost: false, serviceWorker: undefined },
    ]) {
      expect(canRegisterPwaServiceWorker(environment)).toBe(false);
      await expect(registerPwaServiceWorker(environment)).resolves.toBeUndefined();
    }

    expect(register).not.toHaveBeenCalled();
  });
});
