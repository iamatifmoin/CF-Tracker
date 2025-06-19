
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/services/api';
import { Student } from '@/types/student';
import { toast } from '@/hooks/use-toast';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await studentApi.getAll();
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const response = await studentApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student Created",
        description: `${response.data.name} has been added successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create student",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Student> }) =>
      studentApi.update(id, updates),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      toast({
        title: "Student Updated",
        description: `${response.data.name} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update student",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student Deleted",
        description: "Student has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete student",
        variant: "destructive",
      });
    },
  });
};

export const useSyncStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.sync,
    onSuccess: (response, studentId) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      toast({
        title: "Sync Started",
        description: "Student data sync has been initiated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.response?.data?.error || "Failed to sync student data",
        variant: "destructive",
      });
    },
  });
};

export const useToggleEmailReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.toggleEmailReminders,
    onSuccess: (response, studentId) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      toast({
        title: "Email Settings Updated",
        description: response.data.message || "Email settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update email settings",
        variant: "destructive",
      });
    },
  });
};
