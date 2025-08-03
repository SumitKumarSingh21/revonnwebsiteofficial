import { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from?.pathname || '/';
  const mode = searchParams.get('mode') || 'login';

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate(from, { replace: true });
      }
    };
    checkUser();
  }, [navigate, from]);

  if (mode === 'signup') {
    return <SignupForm />;
  }

  return <LoginForm />;
};
export default Auth;