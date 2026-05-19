import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
      <div className="w-full max-w-md">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#ccff00] flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-[#0a0a0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#fafafa] tracking-tight">ProjectHub</span>
        </div>

        <div className="bg-[#111113] rounded-2xl border border-[#27272a] p-8">
          <h1 className="text-2xl font-bold text-center text-[#fafafa] mb-1.5">
            Welcome back
          </h1>
          <p className="text-center text-[#71717a] text-sm mb-8">
            Sign in to your project management workspace
          </p>

          {error && (
            <div
              className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#27272a] bg-[#1a1a1d] px-3 py-2.5 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#ccff00]/40 focus:border-[#ccff00]/50 transition-colors"
                placeholder="you@example.com"
                aria-label="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#27272a] bg-[#1a1a1d] px-3 py-2.5 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#ccff00]/40 focus:border-[#ccff00]/50 transition-colors"
                placeholder="Enter your password"
                aria-label="Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ccff00] text-[#0a0a0b] rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-[#b8e600] focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 focus:ring-offset-2 focus:ring-offset-[#111113] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Sign in"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[#71717a] mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-[#ccff00] hover:text-[#b8e600] font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
