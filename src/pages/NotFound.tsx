// 404 Not Found page
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-muted-foreground">404</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
