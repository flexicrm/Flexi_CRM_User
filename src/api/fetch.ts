import { Reusable_Service } from "../service/Reusable_Service/Reusable_Service";
const api = Reusable_Service();

interface AxiosApiProps {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  params?: any;
}

export const fetch = async ({
  endpoint,
  method = "GET",
  body = {},
  params = null,
}: AxiosApiProps) => {
  try {
    const response = await api({
      url: endpoint,
      method,
      data: body,
      params,
    });

    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.errors ||
      "Something went wrong";

    throw new Error(message);
  }
};
