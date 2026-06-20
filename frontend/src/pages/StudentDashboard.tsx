import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BookOpen, Clock, Target, CheckCircle, Play, ArrowRight, Activity, Zap } from 'lucide-react';
import { StudentDashboardData } from '../types/api';
import { motion, type Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444']; // Blue, Amber, Red

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const StudentDashboard = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await fetchApi('/dashboard/student');
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50/50">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 max-w-lg mx-auto mt-10 bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3">
        <Zap className="text-red-500 w-6 h-6" />
        <p className="font-medium">{error}</p>
      </div>
    </div>
  );
  
  if (!data) return null;

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-end mb-8 relative"
      >
        <div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Your Progress</h2>
          <p className="text-slate-500 mt-2 font-medium">Welcome back! Here's what you've achieved so far.</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-inner border border-blue-100">
                <CheckCircle className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-black text-slate-800">{data.completedLessons}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg shadow-emerald-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl shadow-inner border border-emerald-100">
                <Clock className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Time Spent</p>
                <p className="text-3xl font-black text-slate-800">{data.totalTimeSpent} <span className="text-base font-medium text-slate-500">min</span></p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/60 backdrop-blur-xl border-slate-200/60 shadow-lg shadow-purple-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl shadow-inner border border-purple-100">
                <Target className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Progress</p>
                <p className="text-3xl font-black text-slate-800">{data.averageProgress}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200 shadow-xl shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-24 h-24 text-amber-500" />
            </div>
            <CardContent className="p-6 flex items-center space-x-4 relative z-10">
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/30 text-white">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700/80 uppercase tracking-wider">Last Active</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-600 to-orange-600">{data.lastActive ? data.lastActive : 'Today'}</p>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 w-full opacity-70"></div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Per Course */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-200/50 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-600">No courses enrolled yet</p>
                  <p className="text-sm">Start exploring courses to track your progress here.</p>
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                  {data.courses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants} className="group">
                      <div className="flex justify-between items-center mb-3">
                        <Link to={`/courses/${course.id}`} className="font-semibold text-lg text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-2">
                          {course.title}
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                        </Link>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{course.progressPercent}%</span>
                      </div>
                      <Progress value={course.progressPercent ?? 0} className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500" />
                      <div className="flex justify-between items-center mt-3 text-sm text-slate-500">
                        <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-b from-indigo-50 to-white backdrop-blur-xl border-indigo-100 shadow-xl shadow-indigo-900/5 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Next Steps
              </CardTitle>
              <CardDescription className="text-indigo-700/70">Personalized recommendations for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recommendations.map((rec, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="p-4 rounded-2xl bg-white/80 shadow-sm border border-indigo-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <h4 className="font-bold text-indigo-900 mb-1">{rec.title}</h4>
                  <p className="text-sm text-indigo-600/80 leading-relaxed">{rec.reason}</p>
                </motion.div>
              ))}
              {data.recommendations.length === 0 && (
                <div className="text-center py-8 text-indigo-400">
                  <p>You're all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Trend Chart */}
        <Card className="bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Learning Time</CardTitle>
            <CardDescription>Minutes spent over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeSeries} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="url(#colorMinutes)" 
                    strokeWidth={4} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6', className: 'animate-pulse' }} 
                  />
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Completion Distribution</CardTitle>
            <CardDescription>Breakdown of your learning progress</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-64 w-full flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.completionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    cornerRadius={8}
                  >
                    {data.completionDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Circle Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800">{data.completedLessons}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              {data.completionDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                  <span className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
