export const config = {
  port: import.meta.env.PORT || 3000,
  apiUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:5000",
  jwtSecret: import.meta.env.JWT_SECRET || "your-secret-key",
  appUrlCallback: import.meta.env.VITE_APP_URL_CALLBACK || "http://localhost:3000/callback",
  apiOpenIdConnectUrl: import.meta.env.VITE_APP_API_OPENID_CONNECT_URL || "http://localhost:5000",
  appLogo: import.meta.env.VITE_APP_LOGO || "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
  appName: import.meta.env.VITE_APP_NAME || "My App",
};
