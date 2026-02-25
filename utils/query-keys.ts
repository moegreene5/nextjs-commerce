import { GetCartResult } from "@/features/cart/cart-queries";
import { queryOptions } from "@tanstack/react-query";
import { fetcher } from "./fetcher";

export const cartQueryKey = ["cart"] as const;

export const cart = () =>
  queryOptions({
    queryKey: cartQueryKey,
    queryFn: (): Promise<GetCartResult> => fetcher<GetCartResult>("/api/cart"),
  });
