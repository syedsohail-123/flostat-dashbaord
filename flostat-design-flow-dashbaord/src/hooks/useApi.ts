import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, LoginRequest, SignUpRequest, OtpRequest, Device, Block } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Auth hooks
export const useSendOtp = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: OtpRequest) => apiClient.sendOtp(data),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the OTP',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useVerifyOtp = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: OtpRequest) => apiClient.verifyOtp(data),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'OTP Verified',
          description: 'You can now proceed with signup',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useSignUp = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SignUpRequest) => apiClient.signUp(data),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useLogin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Device hooks
export const useDevices = (orgId: string) => {
  return useQuery({
    queryKey: ['devices', orgId],
    queryFn: () => apiClient.getDevicesByOrg(orgId),
    enabled: !!orgId,
  });
};

export const useDevicesWithStatus = (orgId: string) => {
  return useQuery({
    queryKey: ['devices-status', orgId],
    queryFn: () => apiClient.getDevicesWithStatus(orgId),
    enabled: !!orgId,
    refetchInterval: 30000, // Refetch every 30 seconds for live status
  });
};

export const useCreateDevice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceData: Partial<Device>) => apiClient.createDevice(deviceData),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Device Created',
          description: 'Device has been created successfully',
        });
        // Invalidate devices queries to refetch
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        queryClient.invalidateQueries({ queryKey: ['devices-status'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateDevice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceData: Partial<Device>) => apiClient.updateDevice(deviceData),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Device Updated',
          description: 'Device has been updated successfully',
        });
        // Invalidate devices queries to refetch
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        queryClient.invalidateQueries({ queryKey: ['devices-status'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteDevice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => apiClient.deleteDevice(deviceId),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Device Deleted',
          description: 'Device has been deleted successfully',
        });
        // Invalidate devices queries to refetch
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        queryClient.invalidateQueries({ queryKey: ['devices-status'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Block hooks
export const useBlocks = (orgId: string) => {
  return useQuery({
    queryKey: ['blocks', orgId],
    queryFn: () => apiClient.getBlocksByOrg(orgId),
    enabled: !!orgId,
  });
};

export const useCreateBlock = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockData: Partial<Block>) => apiClient.createBlock(blockData),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Block Created',
          description: 'Block has been created successfully',
        });
        // Invalidate blocks queries to refetch
        queryClient.invalidateQueries({ queryKey: ['blocks'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBlock = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockData: Partial<Block>) => apiClient.updateBlock(blockData),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Block Updated',
          description: 'Block has been updated successfully',
        });
        // Invalidate blocks queries to refetch
        queryClient.invalidateQueries({ queryKey: ['blocks'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteBlock = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) => apiClient.deleteBlock(blockId),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Block Deleted',
          description: 'Block has been deleted successfully',
        });
        // Invalidate blocks queries to refetch
        queryClient.invalidateQueries({ queryKey: ['blocks'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};