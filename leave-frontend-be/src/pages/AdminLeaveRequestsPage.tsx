
import AdminLeaveRequests from '@/components/AdminLeaveRequests';

const AdminLeaveRequestsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-muted-foreground">
          Review and process employee leave requests.
        </p>
      </div>
      <AdminLeaveRequests />
    </div>
  );
};

export default AdminLeaveRequestsPage;
