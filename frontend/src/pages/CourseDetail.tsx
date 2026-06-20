import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchApi } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle, ArrowLeft, Clock, Activity, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { Course } from '../types/api';
import { motion, type Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const loadCourse = useCallback(async () => {
    try {
      const result = await fetchApi(`/courses/${id}`);
      setCourse(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const markComplete = async (lessonId: number) => {
    setMarking(lessonId);
    setError(null);
    try {
      const elapsedMinutes = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 60000));
      await fetchApi(`/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ timeSpentMinutes: elapsedMinutes })
      });
      await loadCourse();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to mark lesson complete');
    } finally {
      setMarking(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50/50">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
  
  if (!course) return (
    <div className="p-6 max-w-lg mx-auto mt-10 bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 rounded-2xl shadow-xl flex items-center justify-between">
      <p className="font-medium">Course not found</p>
      <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-red-200 text-red-700 hover:bg-red-100">Go Back</Button>
    </div>
  );

  const completedCount = (course.lessons || []).filter(l => l.status === 'COMPLETED').length;
  const totalCount = (course.lessons || []).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8 pb-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="mb-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-xl px-4 py-2 h-auto"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Dashboard
      </Button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white overflow-hidden relative border-0 shadow-2xl shadow-indigo-900/20">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150 pointer-events-none">
            <PlayCircle className="w-64 h-64" />
          </div>
          <CardContent className="p-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center space-x-2 bg-indigo-800/50 backdrop-blur-md px-3 py-1 rounded-full text-indigo-200 text-sm font-semibold mb-4 border border-indigo-700/50">
                  <Activity className="w-4 h-4" />
                  <span>Course Overview</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">{course.title}</h2>
                <p className="text-indigo-100/80 text-lg leading-relaxed md:text-xl">{course.description}</p>
              </div>
              <div className="w-full md:w-64 bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shrink-0">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-indigo-200 font-medium">Progress</span>
                  <span className="text-2xl font-bold text-white">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 bg-indigo-950/50 [&>div]:bg-gradient-to-r [&>div]:from-indigo-400 [&>div]:to-blue-400" />
                <p className="text-sm text-indigo-300 mt-3 font-medium text-center">
                  {completedCount} of {totalCount} lessons completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-indigo-500" />
                Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {error && (
                <div className="m-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-slate-100"
              >
                {(course.lessons || []).map((lesson) => {
                  const isCompleted = lesson.status === 'COMPLETED';
                  const isInProgress = lesson.status === 'IN_PROGRESS';
                  const isMarking = marking === lesson.id;

                  return (
                    <motion.div 
                      key={lesson.id} 
                      variants={itemVariants}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-indigo-50/30 transition-colors group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="mt-1 relative">
                          {isCompleted ? (
                            <div className="bg-emerald-100 p-1.5 rounded-full shadow-inner border border-emerald-200">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                          ) : isInProgress ? (
                            <div className="bg-blue-100 p-1.5 rounded-full shadow-inner border border-blue-200 relative">
                              <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20"></div>
                              <PlayCircle className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <div className="bg-slate-100 p-1.5 rounded-full shadow-inner border border-slate-200 group-hover:bg-white transition-colors">
                              <Circle className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className={clsx(
                            "text-lg font-bold transition-colors", 
                            isCompleted ? "text-slate-500 line-through decoration-slate-300 decoration-2" : "text-slate-800 group-hover:text-indigo-700"
                          )}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{lesson.estimatedMinutes} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0 gap-3">
                        <span className={clsx(
                          "px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider",
                          isCompleted ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                          isInProgress ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.2)]" :
                          "bg-slate-100 text-slate-500 border border-slate-200"
                        )}>
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                        </span>
                        
                        {!isCompleted && (
                          <Button
                            onClick={() => markComplete(lesson.id)}
                            disabled={isMarking}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-xl transition-all hover:scale-105 active:scale-95"
                          >
                            {isMarking ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Marking...
                              </>
                            ) : (
                              'Mark Complete'
                            )}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-200/50 sticky top-6">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {(course.activity || []).map((event) => (
                  <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-700 capitalize">{event.type.toLowerCase().replaceAll('_', ' ')}</p>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{event.durationMinutes}m</span>
                        </div>
                        <time className="text-xs font-medium text-slate-400">
                          {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
                {(!course.activity || course.activity.length === 0) && (
                  <div className="text-center py-8 text-slate-400 z-10 relative">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
