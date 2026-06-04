import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Market prices change on the order of minutes, not seconds. A generous
 * staleTime means panning around the UI doesn't hammer the API's rate limit
 * (180 req/min), while retries stay conservative for a flaky crowdsourced source.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
