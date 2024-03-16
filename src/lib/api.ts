import { API_BASEURL } from "./constants";
import { hc } from "hono/dist/client";
import type {
  hc as hono,
  InferRequestType,
  InferResponseType,
  ClientRequestOptions,
  ClientResponse,
} from "hono/client";
import type { AppType } from "../../backend/routes/_routes";
import authStore, { logout } from "@/stores/authStore";

const api: ReturnType<typeof hono<AppType>> = hc(API_BASEURL, {
  fetch: fetchHandler,
});

export class ApiError extends Error {
  code = 400;

  constructor(res: Response, data?: any) {
    const message =
      typeof data === "string"
        ? data
        : typeof data === "object"
        ? data?.message
        : res.statusText;

    super(message);
    this.name = "ApiError";
    this.code = res.status;
  }
}

async function fetchHandler(input: any, init?: RequestInit) {
  const token = authStore.getState().token;

  if (init) {
    init.headers = new Headers(init.headers);
    if (token) {
      init.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (typeof input === "object") {
    input.headers = new Headers(init.headers);
    if (token) {
      input.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(input, init);
  await checkResponse(res);

  return res;
}

async function checkResponse(res: Response) {
  if (res.ok) {
    return;
  }

  let data: any = null;

  try {
    const isJson = res.headers
      .get("Content-Type")
      ?.includes("application/json");
    if (isJson) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch (err) {}

  if (res.status === 401) {
    logout();
  }

  throw new ApiError(res, data);
}

export {
  InferRequestType,
  InferResponseType,
  ClientRequestOptions,
  ClientResponse,
};
export default api;
