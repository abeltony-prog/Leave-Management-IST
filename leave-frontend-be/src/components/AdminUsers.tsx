import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, UserDto, Role } from '@/services/userService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const userSchema = z.object({
  role: z.enum(['ADMIN', 'STAFF']),
  department: z.enum(['HR', 'IT', 'support', 'Recruitment']),
  team: z.enum(['Team A', 'Team B', 'Team C']),
});
type UserFormValues = z.infer<typeof userSchema>;

const AdminUsers = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'STAFF', department: 'HR', team: 'Team A' },
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openDialog = (user: UserDto) => {
    setSelectedUser(user);
    form.reset({
      role: user.role,
      department: (user.department as UserFormValues['department']) || 'HR',
      team: (user.team as UserFormValues['team']) || 'Team A',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    if (!selectedUser) return;
    try {
      await updateUserRole(
        selectedUser.id,
        values.role as Role,
        values.department,
        values.team
      );
      toast.success('User updated');
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">User Management</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-secondary">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Team</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.department || '-'}</td>
                <td className="px-4 py-2">{user.team || '-'}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2 text-right">
                  <Button size="sm" onClick={() => openDialog(user)}>
                    Edit Role
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User {selectedUser.firstName} {selectedUser.lastName}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border p-2">
                          <option value="ADMIN">Admin</option>
                          <option value="STAFF">Staff</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border p-2">
                          <option value="HR">HR</option>
                          <option value="IT">IT</option>
                          <option value="support">support</option>
                          <option value="Recrutument">Recrutument</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border p-2">
                          <option value="Team A">Team A</option>
                          <option value="Team B">Team B</option>
                          <option value="Team C">Team C</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminUsers; 