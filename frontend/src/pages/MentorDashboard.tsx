import { useState, useEffect } from 'react';
import { fetchApi, API_BASE_URL } from '../lib/api';
import { Users, Clock, Target, AlertTriangle, Download, ChevronRight, CheckCircle2, PlayCircle, XCircle } from 'lucide-react';
import { MentorStudent, MentorStudentDetail } from '../types/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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

  const getStatusBadge = (student: MentorStudent) => {
    if (student.coursesNeedingAttention && student.coursesNeedingAttention.length > 0) {
      return <Badge variant="attention" className="gap-1"><AlertTriangle className="w-3 h-3" /> Needs Attention</Badge>;
    }
    if (student.overallProgress === 100) {
      return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
    }
    if (student.overallProgress > 0) {
      return <Badge variant="inProgress" className="gap-1"><PlayCircle className="w-3 h-3" /> In Progress</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><XCircle className="w-3 h-3" /> Not Started</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-8 rounded-3xl border border-white/60 shadow-sm backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Mentor Dashboard</h1>
          <p className="text-slate-500 text-lg max-w-xl">Monitor your students' progress, identify areas needing attention, and guide them to success.</p>
        </div>
        <Button onClick={exportCsv} variant="default" className="gap-2 rounded-2xl px-6 py-6 shadow-md hover:shadow-lg transition-all">
          <Download className="w-5 h-5" /> Export Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Student List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg bg-white/70">
            <CardHeader className="border-b border-slate-100/50 bg-white/40 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Assigned Students
              </CardTitle>
              <CardDescription>Click on a student to view detailed progress metrics.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="w-[250px]">Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">Time Spent</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="[&_tr:last-child]:border-0"
                >
                  {students.map((student) => (
                    <motion.tr
                      key={student.id}
                      variants={itemVariants}
                      onClick={() => loadStudentDetail(student.id)}
                      className={`cursor-pointer transition-colors border-b border-slate-100 group ${
                        selectedStudent?.student.id === student.id ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-slate-900">{student.name}</span>
                          <span className="text-slate-500 text-xs">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${student.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 w-9">{student.overallProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {student.totalTimeSpent}m
                      </TableCell>
                      <TableCell>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform group-hover:text-blue-600 group-hover:translate-x-1 ${selectedStudent?.student.id === student.id ? 'text-blue-600 translate-x-1' : ''}`} />
                      </TableCell>
                    </motion.tr>
                  ))}
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                        No students assigned to you yet.
                      </TableCell>
                    </TableRow>
                  )}
                </motion.tbody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Student Details */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {detailLoading ? (
              <Card className="border-0 shadow-lg bg-white/70 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p>Loading details...</p>
                </div>
              </Card>
            ) : selectedStudent ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="border-0 shadow-lg bg-white/70 overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
                  <CardHeader className="-mt-12 text-center pb-2">
                    <div className="mx-auto w-20 h-20 bg-white rounded-full p-1 shadow-md mb-3 flex items-center justify-center">
                      <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedStudent.student.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{selectedStudent.student.name}</CardTitle>
                    <CardDescription>{selectedStudent.student.email}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Time Spent</div>
                        <div className="text-2xl font-bold text-slate-800 flex justify-center items-baseline gap-1">
                          {selectedStudent.totalTimeSpent} <span className="text-sm font-medium text-slate-500">min</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Completed</div>
                        <div className="text-2xl font-bold text-slate-800 flex justify-center items-baseline gap-1">
                          {selectedStudent.completedLessons} <span className="text-sm font-medium text-slate-500">lssn</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Course Progress
                      </h4>
                      <div className="space-y-4">
                        {selectedStudent.courses.map(course => (
                          <div key={course.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-slate-700 line-clamp-1 flex-1 pr-4">{course.title}</span>
                              <span className="text-slate-500 font-medium">{course.progressPercent}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progressPercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-blue-500 rounded-full" 
                              />
                            </div>
                            <div className="text-xs text-slate-400">
                              {course.completedLessons} of {course.totalLessons} lessons completed
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/70 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500">Select a student from the list to view their detailed progress and metrics.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
