import { isTauri } from '@tauri-apps/api/core';

type PwaRegistrationEnvironment = Readonly<{
  isProduction: boolean;
  isTauriHost: boolean;
  serviceWorker?: Pick<ServiceWorkerContainer, 'register'>;
}>;

export function canRegisterPwaServiceWorker({
  isProduction,
  isTauriHost,
  serviceWorker,
}: PwaRegistrationEnvironment) {
  return isProduction && !isTauriHost && serviceWorker !== undefined;
}

export function registerPwaServiceWorker(
  environment: PwaRegistrationEnvironment = {
    isProduction: import.meta.env.PROD,
    isTauriHost: isTauri(),
    serviceWorker: navigator.serviceWorker,
  },
) {
  const serviceWorker = environment.serviceWorker;
  if (!canRegisterPwaServiceWorker(environment) || !serviceWorker) {
    return Promise.resolve(undefined);
  }

  return serviceWorker.register('/service-worker.js', { scope: '/' });
}
