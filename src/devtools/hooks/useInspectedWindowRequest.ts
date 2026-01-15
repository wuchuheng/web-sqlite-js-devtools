import { useCallback, useEffect, useState } from "react";
import type { ServiceResponse } from "@/devtools/services/databaseService";

type DependencyList = ReadonlyArray<unknown>;

interface UseInspectedWindowRequestResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * 1. Run inspected window request with loading/error state
 * 2. Cache latest successful data
 * 3. Expose reload handler for manual retries
 *
 * @param request - Async request returning InspectedWindowResponse
 * @param deps - Dependencies that should re-run the request
 * @param initialData - Initial data value before first load
 * @returns Request state and reload handler
 */
export const useInspectedWindowRequest = <T>(
  request: () => Promise<ServiceResponse<T>>,
  deps: DependencyList,
  initialData: T,
): UseInspectedWindowRequestResult<T> => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 1. Trigger async request
   * 2. Capture success or error result
   * 3. Update loading state on completion
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[useInspectedWindowRequest] Starting request...");
      const response = await request();

      if (!response.success) {
        console.error(
          "[useInspectedWindowRequest] Request failed:",
          response.error,
        );
        throw new Error(response.error || "Request failed");
      }

      console.log(
        "[useInspectedWindowRequest] Request succeeded:",
        response.data,
      );
      setData((current) => response.data ?? current);
    } catch (fetchError) {
      console.error(
        "[useInspectedWindowRequest] Exception caught:",
        fetchError,
      );
      setError(
        fetchError instanceof Error ? fetchError.message : String(fetchError),
      );
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, reload: load };
};
