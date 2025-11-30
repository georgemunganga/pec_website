import { ComponentType, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteOptions {
  roles?: string[];
  fallbackPath?: string;
}

export function withProtectedRoute<T>(WrappedComponent: ComponentType<T>, options: ProtectedRouteOptions = {}) {
  return function ProtectedRoute(props: T) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [, navigate] = useLocation();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate("/login");
      }
    }, [isAuthenticated, isLoading, navigate]);

    useEffect(() => {
      if (
        !isLoading &&
        isAuthenticated &&
        options.roles?.length &&
        user &&
        !options.roles.includes(user.role ?? "user")
      ) {
        navigate(options.fallbackPath ?? "/404");
      }
    }, [isAuthenticated, isLoading, navigate, options.fallbackPath, options.roles, user]);

    if (isLoading) {
      return (
        <div className="py-20 text-center text-muted-foreground" role="status">
          Checking your session...
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (options.roles?.length && user && !options.roles.includes(user.role ?? "user")) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
