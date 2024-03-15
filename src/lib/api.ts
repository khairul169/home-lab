import { API_BASEURL } from "./constants";
import { hc } from "hono/dist/client";
import type {
  hc as hono,
  InferRequestType,
  InferResponseType,
  ClientRequestOptions,
  ClientResponse,
} from "hono/client";
import type { AppType } from "../../backend";

const api = hc(API_BASEURL) as ReturnType<typeof hono<AppType>>;

export {
  InferRequestType,
  InferResponseType,
  ClientRequestOptions,
  ClientResponse,
};
export default api;
