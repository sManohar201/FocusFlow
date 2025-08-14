import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export function useAuth() {
  const { data: authData, isLoading } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    queryFn: () => apiRequest('GET', '/api/auth/me').then(res => res.json()),
    retry: false,
  });

  return {
    user: authData?.user,
    isAuthenticated: !!authData?.user,
    isLoading,
  };
}
