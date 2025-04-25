
import LeaveRequestForm from '@/components/LeaveRequestForm';

const NewLeaveRequest = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Leave Request</h1>
        <p className="text-muted-foreground">
          Submit a new request for time off.
        </p>
      </div>
      <LeaveRequestForm />
    </div>
  );
};

export default NewLeaveRequest;
