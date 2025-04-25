
import LeaveRequestList from '@/components/LeaveRequestList';

const LeaveRequests = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-muted-foreground">
          View and manage your leave requests.
        </p>
      </div>
      <LeaveRequestList />
    </div>
  );
};

export default LeaveRequests;
