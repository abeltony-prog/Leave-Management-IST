import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { getLeaveStatistics } from '@/services/leaveService'; // Remove mock service
// import type { LeaveStatistics } from '@/services/leaveService'; // Remove mock type
import axiosInstance from '@/lib/axios'; // Import axios
import { toast } from '@/components/ui/sonner'; // Import toast for error handling
import dayjs from 'dayjs'; // Import dayjs for date calculations
import { TeamCalendar } from '@/components/TeamCalendar'; // Import the new component

// Define the type based on backend's LeaveRequestResponseDto
type LeaveRequest = {
  id: number;
  userId: number;
  userFullName: string;
  leaveType: string; // Assuming LeaveType enum is returned as string
  startDate: string; // Assuming YYYY-MM-DD format
  endDate: string; // Assuming YYYY-MM-DD format
  halfDay: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  uploadedDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

// Define minimal type for pending count calculation
type LeaveRequestForPending = {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate: string;
  endDate: string;
  halfDay: boolean;
};

// Simple function to calculate duration between two dates
const calculateDuration = (start: string, end: string): number => {
  // Add 1 because the end date is inclusive
  return dayjs(end).diff(dayjs(start), 'day') + 1;
};

const Dashboard = () => {
  const { user } = useAuth();
  // const [stats, setStats] = useState<LeaveStatistics | null>(null); // Old state
  const [isLoading, setIsLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);

  // Calculate available days from user object
  const totalAllowance = user?.totalLeaveAllowance ?? 0;
  const usedDays = user?.usedLeaveDays ?? 0;
  const availableDays = totalAllowance - usedDays;
  const [pendingDays, setPendingDays] = useState<number>(0);
  const [isPendingLoading, setIsPendingLoading] = useState(true);

  // Separate useEffect to fetch requests specifically for pending count
  useEffect(() => {
    let isMounted = true;
    const fetchPendingCount = async () => {
      if (!user) {
        setIsPendingLoading(false);
        return; // Don't fetch if user isn't logged in
      }
      setIsPendingLoading(true);
      try {
        const response = await axiosInstance.get<LeaveRequestForPending[]>('/leave/requests');
        if (isMounted) {
          const pending = response.data
            .filter((req) => req.status === 'PENDING')
            .reduce((sum, req) => {
              const duration = dayjs(req.endDate).diff(dayjs(req.startDate), 'day') + 1;
              return sum + (req.halfDay ? 0.5 : duration);
            }, 0);
          setPendingDays(pending);
        }
      } catch (err) {
        console.error('Error fetching leave requests for pending count:', err);
        // Optionally set an error state for pending count
      } finally {
        if (isMounted) {
          setIsPendingLoading(false);
        }
      }
    };
    fetchPendingCount();
    return () => {
      isMounted = false;
    };
  }, [user]); // Re-run if user changes

  // Update overall loading state based on user loading OR pending loading
  const isDashboardLoading = isLoading || isPendingLoading;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Welcome, {user?.name || user?.email}!
          </h1>{' '}
          {/* Use email as fallback */}
          <p className='text-muted-foreground'>Here's your leave management dashboard.</p>
        </div>
        <Button asChild>
          <Link to='/leave-requests/new' className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            New Leave Request
          </Link>
        </Button>
      </div>

      {error && (
        <Card className='border-destructive bg-destructive/10'>
          <CardContent className='p-4'>
            <p className='text-sm text-destructive'>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Available Days Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Available Days</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className='flex h-8 items-center'>
                <div className='h-2 w-24 animate-pulse rounded bg-muted'></div>
              </div>
            ) : (
              <div className='text-2xl font-bold'>{availableDays.toFixed(1)} days</div>
            )}
          </CardContent>
        </Card>

        {/* Used Days Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Used Days</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className='flex h-8 items-center'>
                <div className='h-2 w-24 animate-pulse rounded bg-muted'></div>
              </div>
            ) : (
              <div className='text-2xl font-bold'>{usedDays.toFixed(1)} days</div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Requests</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className='flex h-8 items-center'>
                <div className='h-2 w-24 animate-pulse rounded bg-muted'></div>
              </div>
            ) : (
              <div className='text-2xl font-bold'>{pendingDays.toFixed(1)} days</div>
            )}
          </CardContent>
        </Card>

        {/* Total Allowance Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Allowance</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className='flex h-8 items-center'>
                <div className='h-2 w-24 animate-pulse rounded bg-muted'></div>
              </div>
            ) : (
              <div className='text-2xl font-bold'>{totalAllowance.toFixed(1)} days</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lower Section Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Quick Actions & Leave Balance (Spanning 2 cols on large screens) */}
        <div className='space-y-6 lg:col-span-2'>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <Button asChild variant='outline' className='h-20'>
                    <Link
                      to='/leave-requests/new'
                      className='flex flex-col items-center justify-center gap-2'
                    >
                      <Plus className='h-5 w-5' />
                      <span>New Request</span>
                    </Link>
                  </Button>
                  <Button asChild variant='outline' className='h-20'>
                    <Link
                      to='/leave-requests'
                      className='flex flex-col items-center justify-center gap-2'
                    >
                      <FileText className='h-5 w-5' />
                      <span>My Requests</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Leave Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Balance</CardTitle>
              </CardHeader>
              <CardContent>
                {isDashboardLoading ? (
                  <div className='space-y-2'>
                    <div className='h-2 w-full animate-pulse rounded bg-muted'></div>
                    <div className='h-2 w-3/4 animate-pulse rounded bg-muted'></div>
                    <div className='h-2 w-1/2 animate-pulse rounded bg-muted'></div>
                  </div>
                ) : (
                  <>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm font-medium'>Annual Leave</span>
                      <span>
                        <span className='font-medium text-primary'>{availableDays.toFixed(1)}</span>{' '}
                        / {totalAllowance.toFixed(1)} days
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-muted'>
                      <div
                        className='h-2 rounded-full bg-primary'
                        style={{
                          width: `${totalAllowance > 0 ? (usedDays / totalAllowance) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Calendar (Spanning 1 col on large screens) */}
        <div className='lg:col-span-1'>
          <TeamCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
