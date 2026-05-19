import { useCallback, useState } from 'react';

const STORAGE_KEY = 'rainpath_onboarding_dismissed';

export interface UseOnboardingResult {
  showOnboarding: boolean;
  dismissOnboarding: (dontShowAgain: boolean) => void;
  resetOnboarding: () => void;
}

export function useOnboarding(): UseOnboardingResult {
  const [show, setShow] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const dismiss = useCallback((dontShowAgain: boolean) => {
    setShow(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        /* ignore */
      }
    }
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setShow(true);
  }, []);

  return {
    showOnboarding: show,
    dismissOnboarding: dismiss,
    resetOnboarding: reset,
  };
}
