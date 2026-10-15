interface AppEnvironment {
  VITE_API_URL?: string;
  VITE_DEMO_MODE?: string;
  DEV?: boolean;
}

export function resolveAppConfig(environment: AppEnvironment) {
  return {
    isDemoMode: environment.VITE_DEMO_MODE?.trim() === 'true',
    apiUrl: (environment.VITE_API_URL?.trim() || (environment.DEV ? 'http://localhost:3000/api' : '/api')).replace(/\/+$/, ''),
  };
}
