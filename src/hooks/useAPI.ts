import api, { APIParams } from "@/lib/api";
import { useQuery } from "react-query";

const useAPI = <T = any>(url: string, params?: APIParams) => {
  return useQuery({
    queryKey: [url, params],
    queryFn: async () => api<T>(url, { params }),
  });
};

export default useAPI;
