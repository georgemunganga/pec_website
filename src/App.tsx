import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { RecentlyViewedProvider } from "./contexts/RecentlyViewedContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MobileNav } from "./components/MobileNav";
import { PagePreloader } from "./components/PagePreloader";
import { SkipToContent } from "./components/SkipToContent";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { BackToTop } from "./components/BackToTop";
import { RouteLoader } from "./components/RouteLoader";
import { NetworkStatusBanner } from "./components/NetworkStatusBanner";
import { withProtectedRoute } from "./components/routing/withProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/account/Dashboard"));
const Orders = lazy(() => import("./pages/account/Orders"));
const OrderDetails = lazy(() => import("./pages/account/OrderDetails"));
const Profile = lazy(() => import("./pages/account/Profile"));
const Addresses = lazy(() => import("./pages/account/Addresses"));
const WishlistPage = lazy(() => import("./pages/account/Wishlist"));
const Returns = lazy(() => import("./pages/account/Returns"));
const Support = lazy(() => import("./pages/account/Support"));
const Notifications = lazy(() => import("./pages/account/Notifications"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Location = lazy(() => import("./pages/Location"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Comparison = lazy(() => import("./pages/Comparison"));
const ServerError = lazy(() => import("./pages/ServerError"));
const NotFound = lazy(() => import("./pages/NotFound"));

const ProtectedDashboard = withProtectedRoute(Dashboard);
const ProtectedOrders = withProtectedRoute(Orders);
const ProtectedOrderDetails = withProtectedRoute(OrderDetails);
const ProtectedProfile = withProtectedRoute(Profile);
const ProtectedAddresses = withProtectedRoute(Addresses);
const ProtectedWishlist = withProtectedRoute(WishlistPage);
const ProtectedReturns = withProtectedRoute(Returns);
const ProtectedSupport = withProtectedRoute(Support);
const ProtectedNotifications = withProtectedRoute(Notifications);

function Router() {
  return (
    <>
      <SkipToContent />
      <RouteLoader />
      <div className="flex flex-col min-h-screen">
        <Header />
        <Breadcrumbs />
        <NetworkStatusBanner />
        <main id="main-content" className="flex-1">
          <Suspense
            fallback={<div className="py-24 text-center text-muted-foreground">Loading experience...</div>}
          >
            <Switch>
              <Route path={"/"} component={Home} />
              <Route path="/shop" component={Shop} />
              <Route path="/product/:id" component={ProductDetail} />
              <Route path="/cart" component={Cart} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/thank-you" component={ThankYou} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/account" component={ProtectedDashboard} />
              <Route path="/account/orders" component={ProtectedOrders} />
              <Route path="/account/orders/:id" component={ProtectedOrderDetails} />
              <Route path="/account/profile" component={ProtectedProfile} />
              <Route path="/account/addresses" component={ProtectedAddresses} />
              <Route path="/account/wishlist" component={ProtectedWishlist} />
              <Route path="/account/notifications" component={ProtectedNotifications} />
              <Route path="/account/returns" component={ProtectedReturns} />
              <Route path="/account/support" component={ProtectedSupport} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route path="/location" component={Location} />
              <Route path="/order-tracking" component={OrderTracking} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/return-policy" component={ReturnPolicy} />
              <Route path="/comparison" component={Comparison} />
              <Route path="/500" component={ServerError} />
              <Route path={"/404"} component={NotFound} />
              {/* Final fallback route */}
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
        <Footer />
        <MobileNav />
        <BackToTop />
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <ComparisonProvider>
                    <TooltipProvider>
                      <PagePreloader />
                      <Toaster />
                      <Router />
                    </TooltipProvider>
                  </ComparisonProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
