
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import StudentsTable from '@/components/students/StudentsTable';
import StudentProfile from '@/components/students/StudentProfile';
import { Student } from '@/types/student';

const Index = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header />
      <main className="container mx-auto py-6 px-4 animate-fade-in">
        {selectedStudent ? (
          <StudentProfile 
            student={selectedStudent} 
            onBack={handleBackToStudents}
          />
        ) : (
          <StudentsTable onViewStudent={handleViewStudent} />
        )}
      </main>
    </div>
  );
};

export default Index;
