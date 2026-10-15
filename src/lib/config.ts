import { resolveAppConfig } from '../utils/appConfig';

export const { isDemoMode, apiUrl: API_URL } = resolveAppConfig(import.meta.env);
