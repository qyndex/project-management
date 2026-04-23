import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './lib/AuthProvider';
import { supabase } from './lib/supabase';
import { ProjectContext } from './hooks/useProject';
import type { Project } from './types/database';
import KanbanBoard from './pages/KanbanBoard';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Signup from './pages/Signup';

/** Redirects to /login if the user is not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/** Redirects to / if the user IS authenticated */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Board' },
    { to: '/calendar', label: 'Calendar' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-indigo-600">ProjectHub</span>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<KanbanBoard />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </main>
    </div>
  );
}

function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      setLoading(true);

      // Try to find a project the user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id)
        .limit(1);

      if (memberError) {
        // If RLS prevents access (no memberships yet), create a default project
        const proj = await createDefaultProject(user.id);
        setProject(proj);
        setLoading(false);
        return;
      }

      if (memberships && memberships.length > 0) {
        const { data: proj, error: projError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', memberships[0].project_id)
          .single();

        if (projError) {
          setError(projError.message);
        } else {
          setProject(proj);
        }
      } else {
        // No projects — create a default one
        const proj = await createDefaultProject(user.id);
        setProject(proj);
      }
      setLoading(false);
    };

    fetchProject();
  }, [user]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        projectId: project?.id ?? null,
        loading,
        error,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

async function createDefaultProject(userId: string): Promise<Project | null> {
  const { data: proj, error: createError } = await supabase
    .from('projects')
    .insert({
      name: 'My Project',
      description: 'Your first project — start adding tasks!',
      owner_id: userId,
    })
    .select()
    .single();

  if (createError || !proj) return null;

  // Add user as owner member
  await supabase
    .from('project_members')
    .insert({
      project_id: proj.id,
      user_id: userId,
      role: 'owner',
    });

  return proj;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ProjectProvider>
                <AppLayout />
              </ProjectProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
