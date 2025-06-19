import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Student } from '@/types/student';
import { getCodeforcesRatingTitle, formatRating } from '@/utils/codeforcesApi';
import { Plus, Download, Search, Edit, Trash, Eye, ExternalLink, RefreshCw, Mail, MailX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStudents, useDeleteStudent, useSyncStudent, useToggleEmailReminders } from '@/hooks/useStudents';
import { AddStudentDialog } from './AddStudentDialog';

interface StudentsTableProps {
  onViewStudent: (student: Student) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({ onViewStudent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const { data: students = [], isLoading, error } = useStudents();
  const deleteStudentMutation = useDeleteStudent();
  const syncStudentMutation = useSyncStudent();
  const toggleEmailMutation = useToggleEmailReminders();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Codeforces Handle', 'Current Rating', 'Max Rating', 'Last Updated', 'Sync Status', 'Inactive Days'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        student.phone,
        student.codeforcesHandle,
        student.currentRating,
        student.maxRating,
        student.lastUpdated ? new Date(student.lastUpdated).toISOString() : '',
        student.syncStatus || 'unknown',
        student.inactiveDays || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openCodeforcesProfile = (handle: string) => {
    window.open(`https://codeforces.com/profile/${handle}`, '_blank');
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const handleSyncStudent = (studentId: string) => {
    syncStudentMutation.mutate(studentId);
  };

  const handleToggleEmail = (studentId: string) => {
    toggleEmailMutation.mutate(studentId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-lg">Loading students...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 text-lg">Failed to load students</p>
        <p className="text-slate-500">Please check if the backend server is running</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Students ({filteredStudents.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              </div>
              <Button onClick={handleExportCSV} variant="outline" className="gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No students found matching your search.' : 'No students added yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 dark:border-slate-700">
                    <TableHead className="w-[280px] min-w-[280px] text-slate-700 dark:text-slate-300 font-semibold">Student</TableHead>
                    <TableHead className="w-[200px] min-w-[200px] text-slate-700 dark:text-slate-300 font-semibold">Contact</TableHead>
                    <TableHead className="w-[140px] min-w-[140px] text-slate-700 dark:text-slate-300 font-semibold">Current Rating</TableHead>
                    <TableHead className="w-[140px] min-w-[140px] text-slate-700 dark:text-slate-300 font-semibold">Max Rating</TableHead>
                    <TableHead className="w-[120px] min-w-[120px] text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                    <TableHead className="w-[160px] min-w-[160px] text-right text-slate-700 dark:text-slate-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100">
                            {student.name}
                          </h3>
                          <button 
                            onClick={() => openCodeforcesProfile(student.codeforcesHandle)}
                            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 group"
                          >
                            @{student.codeforcesHandle}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {student.phone}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            Updated {student.lastUpdated ? formatDistanceToNow(new Date(student.lastUpdated), { addSuffix: true }) : 'never'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {student.email}
                          </p>
                          {student.emailReminderCount > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {student.emailReminderCount} reminder{student.emailReminderCount !== 1 ? 's' : ''} sent
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="outline"
                          className={`rating-color ${getCodeforcesRatingTitle(student.currentRating)} border-slate-300 dark:border-slate-600`}
                        >
                          {formatRating(student.currentRating)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="outline"
                          className={`rating-color ${getCodeforcesRatingTitle(student.maxRating)} border-slate-300 dark:border-slate-600`}
                        >
                          {formatRating(student.maxRating)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <Badge 
                            variant={student.syncStatus === 'success' ? 'default' : student.syncStatus === 'error' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {student.syncStatus || 'pending'}
                          </Badge>
                          {student.isInactive && (
                            <Badge variant="destructive" className="text-xs block w-fit">
                              {student.inactiveDays}d inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewStudent(student)}
                            className="border-slate-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 h-9 w-9 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSyncStudent(student.id)}
                            disabled={syncStudentMutation.isPending}
                            className="border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9 w-9 p-0"
                            title="Sync Data"
                          >
                            <RefreshCw className={`h-4 w-4 ${syncStudentMutation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleEmail(student.id)}
                            disabled={toggleEmailMutation.isPending}
                            className="border-slate-300 dark:border-slate-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 h-9 w-9 p-0"
                            title={student.emailRemindersEnabled ? "Disable Email Reminders" : "Enable Email Reminders"}
                          >
                            {student.emailRemindersEnabled ? <Mail className="h-4 w-4" /> : <MailX className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-slate-300 dark:border-slate-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 h-9 w-9 p-0"
                            title="Edit Student"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteStudent(student.id)}
                            disabled={deleteStudentMutation.isPending}
                            className="border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 h-9 w-9 p-0"
                            title="Delete Student"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};

export default StudentsTable;
