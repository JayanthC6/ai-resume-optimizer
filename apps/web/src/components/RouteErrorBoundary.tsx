import { useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();

  // Log error to console only; never show raw error details to the user
  console.error('Unhandled route error caught by RouteErrorBoundary:', error);

  const handleGoHome = () => {
    window.location.href = '/home';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          An unexpected error occurred while loading this view. You can return to the home screen or try reloading the page.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleReload}
            className="flex items-center gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Reload
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
