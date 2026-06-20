import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Course } from '../types/api';

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await fetchApi('/courses');
        setCourses(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">All Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{course.title}</h3>
            </div>
            <p className="text-sm text-slate-600 flex-1 mb-6">{course.description}</p>
            <Link 
              to={`/courses/${course.id}`}
              className="w-full text-center py-2 px-4 rounded-xl font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              View Course
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
