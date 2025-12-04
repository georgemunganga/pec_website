import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';

export function Breadcrumbs() {
  const [location] = useLocation();

  const breadcrumbs = useMemo(() => {
    const paths = location.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // Format the label
      let label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Handle special cases
      if (path === 'order-tracking') label = 'Order Tracking';
      if (path === 'return-policy') label = 'Return Policy';
      if (path === 'thank-you') label = 'Thank You';

      // Don't add breadcrumb for dynamic IDs (like product IDs)
      if (index === paths.length - 1 && /^[a-z0-9-]+$/.test(path) && paths[index - 1]) {
        // This might be a dynamic ID, skip it or handle specially
        return;
      }

      crumbs.push({ label, href: currentPath });
    });

    return crumbs;
  }, [location]);

  // Don't show breadcrumbs on home page
  if (location === '/') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="container py-4">
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium" aria-current="page">
                {index === 0 && <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />}
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                {index === 0 && <Home className="w-4 h-4" aria-hidden="true" />}
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
