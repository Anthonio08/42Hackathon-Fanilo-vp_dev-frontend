class Config {
  static readonly API_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BASE_URL ||
    "http://127.0.0.1:8000/api/v1"
  ).replace(/\/+$/, "");
  static readonly APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Fanilo";
  static readonly APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";

  // Rétro-compatibilité
  static readonly BASE_URL = Config.API_URL;
}

export default Config;
export { Config };
