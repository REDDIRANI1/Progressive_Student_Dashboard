import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'MENTOR') {
        navigate('/mentor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = () => {
    setEmail('student@example.com');
    setPassword('password123');
  };

  const handleDemoMentor = () => {
    setEmail('mentor@example.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl dark:bg-slate-950/80 shadow-2xl border-white/20 dark:border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-extrabold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-white/50 dark:bg-slate-900/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/50 dark:bg-slate-900/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-6 mt-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center w-full">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" onClick={handleDemoStudent} className="w-full text-xs bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800">
                Demo Student
              </Button>
              <Button variant="outline" onClick={handleDemoMentor} className="w-full text-xs bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800">
                Demo Mentor
              </Button>
            </div>
            <div className="text-center text-sm w-full mt-4">
              <span className="text-slate-600 dark:text-slate-400">Don't have an account? </span>
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
