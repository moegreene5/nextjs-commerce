type FetchResponse<T> = {
  data: T;
  status: boolean;
  message?: string;
};

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP error! Status: ${response.status}`);
  }

  const result: FetchResponse<T> = await response.json();
  return result.data;
};
