
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export const useSyncSettings = () => {
  return useQuery({
    queryKey: ['syncSettings'],
    queryFn: async () => {
      const response = await syncApi.getSettings();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSyncStatus = () => {
  return useQuery({
    queryKey: ['syncStatus'],
    queryFn: async () => {
      const response = await syncApi.getStatus();
      return response.data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time status
  });
};

export const useUpdateSyncSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncSettings'] });
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
      toast({
        title: "Sync Settings Updated",
        description: "Your sync configuration has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update sync settings",
        variant: "destructive",
      });
    },
  });
};

export const useTriggerManualSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncApi.triggerManualSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Manual Sync Started",
        description: "Syncing all student data in the background.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.response?.data?.error || "Failed to start manual sync",
        variant: "destructive",
      });
    },
  });
};

export const useSyncLogs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['syncLogs', page, limit],
    queryFn: async () => {
      const response = await syncApi.getLogs(page, limit);
      return response.data;
    },
  });
};

export const useTriggerInactivityCheck = () => {
  return useMutation({
    mutationFn: syncApi.triggerInactivityCheck,
    onSuccess: () => {
      toast({
        title: "Inactivity Check Started",
        description: "Checking for inactive students and sending reminders.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to start inactivity check",
        variant: "destructive",
      });
    },
  });
};
