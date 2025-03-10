import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // If this is an email confirmation (has type=signup in hash), redirect to email-confirmation
        if (window.location.hash && window.location.hash.includes('type=signup')) {
          navigate('/email-confirmation', { replace: true });
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  // Show a loading state while handling the callback
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Processing authentication...</p>
      </div>
    </div>
  );
}

export default AuthCallback; 