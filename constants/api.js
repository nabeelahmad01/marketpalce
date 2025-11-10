const DEFAULT_API_URL = 'http://192.168.0.25:5000/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
