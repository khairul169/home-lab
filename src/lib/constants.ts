export const BASEURL = __DEV__
  ? "http://localhost:3000"
  : location.protocol + "//" + location.host;

export const API_BASEURL = BASEURL + "/api";
