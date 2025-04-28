import AdminUsers from '@/components/AdminUsers';

const AdminUsersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage application users and their roles.</p>
      </div>
      <AdminUsers />
    </div>
  );
};

export default AdminUsersPage; 