import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { Users, Clock, Target, AlertTriangle } from 'lucide-react';

export const MentorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const result = await fetchApi('/mentor/students');
        setStudents(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Your Students</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <div key={student.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{student.name}</h3>
                <p className="text-sm text-slate-500">{student.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Avg. Progress</span>
                </div>
                <span className="font-bold text-slate-800">{student.overallProgress}%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">Time Spent</span>
                </div>
                <span className="font-bold text-slate-800">{student.totalTimeSpent} min</span>
              </div>

              {student.coursesNeedingAttention && student.coursesNeedingAttention.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center space-x-2 text-amber-800 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Needs Attention</span>
                  </div>
                  <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                    {student.coursesNeedingAttention.map((course, idx) => (
                      <li key={idx}>{course}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">No students assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
