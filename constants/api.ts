// Pour tester sur téléphone physique : remplacez par votre IP locale
// ex: 'http://192.168.1.105:8080'
export const BASE_URL = 'http://10.238.164.223:8080'; // Émulateur Android → localhost

export const API = {
  // Auth
  LOGIN:           `${BASE_URL}/api/v1/auth/login`,
  REGISTER:        `${BASE_URL}/api/v1/auth/register`,
  ME:              `${BASE_URL}/api/v1/auth/me`,
  UPDATE_ME:       `${BASE_URL}/api/v1/auth/me`,
  FORGOT_PASSWORD: `${BASE_URL}/api/v1/auth/forgot-password`,
  VERIFY_OTP:      `${BASE_URL}/api/v1/auth/verify-otp`,
  RESET_PASSWORD:  `${BASE_URL}/api/v1/auth/reset-password`,

  // Offers (consumer browsing)
  OFFERS:          `${BASE_URL}/api/v1/offers`,
  OFFER: (id: string) => `${BASE_URL}/api/v1/offers/${id}`,
  JOIN_OFFER: (id: string) => `${BASE_URL}/api/v1/offers/${id}/join`,

  // Consumer orders
  MY_ORDERS:             `${BASE_URL}/api/v1/orders/mine`,
  CONFIRM_RECEIPT: (id: string) => `${BASE_URL}/api/v1/orders/${id}/confirm-receipt`,
  OPEN_DISPUTE:    (id: string) => `${BASE_URL}/api/v1/orders/${id}/dispute`,

  // Messaging
  CONVERSATIONS:         `${BASE_URL}/api/v1/messages/conversations`,
  START_CONVERSATION:    `${BASE_URL}/api/v1/messages/conversations/start`,
  CONVERSATION: (id: string) => `${BASE_URL}/api/v1/messages/conversations/${id}`,
  SEND_MESSAGE: (id: string) => `${BASE_URL}/api/v1/messages/conversations/${id}/send`,

  // Reference data
  ZONES:  `${BASE_URL}/api/v1/zones`,
  RELAYS: `${BASE_URL}/api/v1/relays`,
} as const;
