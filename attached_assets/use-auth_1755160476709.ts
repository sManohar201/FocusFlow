import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const { data: authData, isLoading } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: authData?.user,
    isAuthenticated: !!authData?.user,
    isLoading,
  };
}