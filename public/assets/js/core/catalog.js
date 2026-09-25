import { get } from './api.js';
import { FALLBACK_SERVICES, PROVINCES } from './data.js';

export const loadServices = () => get('/public/services').then((d) => (d.services?.length ? d.services : FALLBACK_SERVICES)).catch(() => FALLBACK_SERVICES);
export const loadAreas = () => get('/public/service-areas').then((d) => d.areas).catch(() => PROVINCES.map((p) => ({ ...p, isActive: true, cities: [] })));
export const loadReviews = (page = 1, limit = 9) => get(`/public/reviews?page=${page}&limit=${limit}`).catch(() => ({ summary: { count: 0, average: null }, reviews: [], pagination: null }));
