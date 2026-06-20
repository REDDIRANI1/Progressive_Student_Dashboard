import { useState, useEffect } from 'react';
import { fetchApi, API_BASE_URL } from '../lib/api';
import { Users, Clock, Target, AlertTriangle, Download } from 'lucide-react';
import { MentorStudent, MentorStudentDetail } from '../types/api';

export const MentorDashboard = () => {
  const [students, setStudents] = useState<MentorStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<MentorStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const loadStudentDetail = async (studentId: number) => {
    setDetailLoading(true);
    try {
      const result = await fetchApi(`/mentor/students/${studentId}/dashboard`);
      setSelectedStudent(result);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const exportCsv = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/export/progress.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'progress.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Your Students</h2>
        <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <button
            key={student.id}
            onClick={() => loadStudentDetail(student.id)}
            className="text-left bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-shadow"
          >
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
                    {student.coursesNeedingAttention.map((course, idx) => <li key={idx}>{course}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </button>
        ))}
        {students.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">No students assigned to you yet.</p>
          </div>
        )}
      </div>

      {(detailLoading || selectedStudent) && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {detailLoading ? (
            <p className="text-slate-500">Loading student details...</p>
          ) : selectedStudent ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedStudent.student.name} Details</h3>
                <p className="text-sm text-slate-500">{selectedStudent.student.email}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold">{selectedStudent.completedLessons}</p></div>
                <div className="p-4 rounded-xl bg-slate-50"><p className="text-sm text-slate-500">Time</p><p className="text-2xl font-bold">{selectedStudent.totalTimeSpent} min</p></div>
                <div className="p-4 rounded-xl bg-slate-50"><p className="text-sm text-slate-500">Average</p><p className="text-2xl font-bold">{selectedStudent.averageProgress}%</p></div>
              </div>
              <div className="space-y-3">
                {selectedStudent.courses.map(course => (
                  <div key={course.id}>
                    <div className="flex justify-between text-sm mb-1"><span>{course.title}</span><span>{course.completedLessons}/{course.totalLessons} lessons · {course.progressPercent}%</span></div>
                    <div className="h-2 bg-slate-100 rounded-full"><div className="h-2 bg-blue-600 rounded-full" style={{ width: `${course.progressPercent}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
