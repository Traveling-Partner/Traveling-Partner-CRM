"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult
} from "@tanstack/react-query";
import { useAuthToken } from "@/hooks/api/use-auth-token";

type AuthenticatedMutationFn<TData, TVariables> = (ctx: {
  token: string;
  variables: TVariables;
}) => Promise<TData>;

export type UseApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables, unknown>,
  "mutationFn"
> & {
  mutationFn: AuthenticatedMutationFn<TData, TVariables>;
  /** Query keys to invalidate after a successful mutation. */
  invalidateKeys?: QueryKey[];
};

export function useApiMutation<TData, TVariables = void>(
  options: UseApiMutationOptions<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const { mutationFn, invalidateKeys, onSuccess, ...rest } = options;

  return useMutation({
    ...rest,
    mutationFn: async (variables) => {
      if (!token) {
        throw new Error("Authentication required.");
      }
      return mutationFn({ token, variables });
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidateKeys?.length) {
        await Promise.all(
          invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
        );
      }
      await onSuccess?.(data, variables, onMutateResult, context);
    }
  });
}
