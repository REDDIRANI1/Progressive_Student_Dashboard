/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../lib/api';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import clsx from 'clsx';
import { Course } from '../types/api';

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);

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
    try {
      await fetchApi(`/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ timeSpentMinutes: course?.lessons?.find(l => l.id === lessonId)?.estimatedMinutes || 0 })
      });
      await loadCourse();
    } catch (err: any) {
      console.error(err);
    } finally {
      setMarking(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!course) return <div className="p-4 bg-red-50 text-red-600 rounded-xl">Course not found</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800">{course.title}</h2>
        <p className="text-slate-600 mt-2 text-lg">{course.description}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">Lessons</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {(course.lessons || []).map((lesson) => {
            const isCompleted = lesson.status === 'COMPLETED';
            const isInProgress = lesson.status === 'IN_PROGRESS';
            const isMarking = marking === lesson.id;

            return (
              <div key={lesson.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : isInProgress ? (
                      <PlayCircle className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4 className={clsx("text-lg font-medium", isCompleted ? "text-slate-600 line-through decoration-slate-300" : "text-slate-800")}>
                      {lesson.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">Est. time: {lesson.estimatedMinutes} min</p>
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-4 sm:mt-0">
                  <span className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-full sm:mb-3",
                    isCompleted ? "bg-emerald-100 text-emerald-700" :
                    isInProgress ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                  </span>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => markComplete(lesson.id)}
                      disabled={isMarking}
                      className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isMarking ? 'Marking...' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Activity History</h3>
        <div className="space-y-3">
          {(course.activity || []).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div>
                <p className="font-medium text-slate-700">{event.type.replaceAll('_', ' ')}</p>
                <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
              <span className="text-sm font-semibold text-slate-600">{event.durationMinutes} min</span>
            </div>
          ))}
          {(!course.activity || course.activity.length === 0) && (
            <p className="text-sm text-slate-500">No activity recorded for this course yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
