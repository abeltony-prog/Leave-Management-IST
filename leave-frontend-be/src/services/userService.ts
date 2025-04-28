import axiosInstance from '@/lib/axios';

export type Role = 'ADMIN' | 'STAFF';

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  department?: string;
  team?: string;
}

export const getAllUsers = async (): Promise<UserDto[]> => {
  const response = await axiosInstance.get<UserDto[]>('/users');
  return response.data;
};

export const updateUserRole = async (
  id: number,
  role: Role,
  department: string,
  team: string
): Promise<UserDto> => {
  const response = await axiosInstance.put<UserDto>(
    `/users/${id}/role`,
    { role, department, team }
  );
  return response.data;
}; 