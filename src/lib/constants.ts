export const BASEURL = __DEV__
  ? "http://localhost:3000"
  : location.protocol + "//" + location.host;

export const API_BASEURL = BASEURL + "/api";
export const WS_BASEURL = BASEURL.replace("https://", "wss://").replace(
  "http://",
  "ws://"
);

export const APP_NAME = "Home Lab";
