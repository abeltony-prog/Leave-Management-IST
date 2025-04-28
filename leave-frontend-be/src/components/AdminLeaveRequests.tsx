import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileText, Search } from 'lucide-react';
import {
  getAllLeaveRequests,
  updateLeaveStatus,
  exportLeavesToCsv,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  LeaveFilters,
  downloadLeaveDocument,
} from '@/services/leaveService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const filterSchema = z.object({
  department: z.string().optional(),
  status: z.enum(['ALL', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  leaveType: z.enum(['ALL', 'ANNUAL', 'SICK', 'PERSONAL', 'UNPAID', 'OTHER']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    required_error: 'Please select a status',
  }),
  adminComment: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;
type StatusUpdateValues = z.infer<typeof statusUpdateSchema>;

const AdminLeaveRequests = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      department: '',
      status: 'ALL',
      leaveType: 'ALL',
      startDate: undefined,
      endDate: undefined,
    },
  });

  const statusForm = useForm<StatusUpdateValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: undefined,
      adminComment: '',
    },
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async (filters?: LeaveFilters) => {
    try {
      setIsLoading(true);
      const data = await getAllLeaveRequests(filters);
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (data: FilterValues) => {
    const filters: LeaveFilters = {};

    if (data.department) filters.department = data.department;
    if (data.status && data.status !== 'ALL') filters.status = data.status as LeaveStatus;
    if (data.leaveType && data.leaveType !== 'ALL') filters.leaveType = data.leaveType as LeaveType;

    if (data.startDate) {
      filters.startDate = format(data.startDate, 'yyyy-MM-dd');
    }

    if (data.endDate) {
      filters.endDate = format(data.endDate, 'yyyy-MM-dd');
    }

    fetchLeaveRequests(filters);
  };

  const handleExportCsv = async () => {
    try {
      const filters: LeaveFilters = {};
      const formValues = filterForm.getValues();

      if (formValues.department) filters.department = formValues.department;
      if (formValues.status && formValues.status !== 'ALL')
        filters.status = formValues.status as LeaveStatus;
      if (formValues.leaveType && formValues.leaveType !== 'ALL')
        filters.leaveType = formValues.leaveType as LeaveType;

      if (formValues.startDate) {
        filters.startDate = format(formValues.startDate, 'yyyy-MM-dd');
      }

      if (formValues.endDate) {
        filters.endDate = format(formValues.endDate, 'yyyy-MM-dd');
      }

      await exportLeavesToCsv(filters);
      toast.success('CSV report downloaded successfully');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV report');
    }
  };

  const handleUpdateStatus = async (data: StatusUpdateValues) => {
    if (!selectedRequest) return;

    setIsUpdatingStatus(true);
    try {
      await updateLeaveStatus(selectedRequest.id, data.status, data.adminComment);

      toast.success(`Leave request ${data.status.toLowerCase()}`);
      setIsStatusDialogOpen(false);
      fetchLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update leave request status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenStatusDialog = (request: LeaveRequest) => {
    setSelectedRequest(request);
    statusForm.reset({
      status: undefined,
      adminComment: '',
    });
    setIsStatusDialogOpen(true);
  };

  const handleDownloadDocument = async (request: LeaveRequest) => {
    try {
      if (!request.documentUrl) {
        toast.error('No document available for download');
        return;
      }

      await downloadLeaveDocument(request.id, `leave-document-${request.id}.pdf`);

      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const isPendingRequest = (request: LeaveRequest) => request.status === 'PENDING';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests Management</CardTitle>
        <CardDescription>Review and manage employee leave requests</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Filter Form */}
        <Card className='border-dashed mb-6'>
          <CardContent className='pt-6'>
            <Form {...filterForm}>
              <form
                onSubmit={filterForm.handleSubmit(handleFilter)}
                className='grid gap-4 md:grid-cols-4 lg:grid-cols-6'
              >
                <FormField
                  control={filterForm.control}
                  name='department'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder='Department' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={filterForm.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Filter by status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='ALL'>All Statuses</SelectItem>
                          <SelectItem value='PENDING'>Pending</SelectItem>
                          <SelectItem value='APPROVED'>Approved</SelectItem>
                          <SelectItem value='REJECTED'>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filterForm.control}
                  name='leaveType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Filter by type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='ALL'>All Types</SelectItem>
                          <SelectItem value='ANNUAL'>Annual</SelectItem>
                          <SelectItem value='SICK'>Sick</SelectItem>
                          <SelectItem value='PERSONAL'>Personal</SelectItem>
                          <SelectItem value='UNPAID'>Unpaid</SelectItem>
                          <SelectItem value='OTHER'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filterForm.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>From Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'MMM d, yyyy')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className='p-3 pointer-events-auto'
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <FormField
                  control={filterForm.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>To Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'MMM d, yyyy')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className='p-3 pointer-events-auto'
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <div className='flex items-end gap-2 md:col-span-3'>
                  <Button type='submit' className='w-full md:w-auto'>
                    Apply Filters
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      filterForm.reset();
                      fetchLeaveRequests();
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div className='flex items-end'>
                  <Button
                    type='button'
                    className='w-full'
                    variant='secondary'
                    onClick={handleExportCsv}
                  >
                    <Download className='mr-2 h-4 w-4' />
                    Export CSV
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          </div>
        ) : requests.length === 0 ? (
          <div className='flex h-40 flex-col items-center justify-center text-center'>
            <FileText className='mb-2 h-10 w-10 text-muted-foreground' />
            <h3 className='font-medium'>No Leave Requests Found</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Try adjusting your filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-12 gap-4 rounded-md bg-secondary px-4 py-2 font-medium'>
              <div className='col-span-3'>Employee</div>
              <div className='col-span-2'>Type</div>
              <div className='col-span-3'>Date Range</div>
              <div className='col-span-2'>Status</div>
              <div className='col-span-2 text-right'>Actions</div>
            </div>

            {requests.map((request) => (
              <div
                key={request.id}
                className='grid grid-cols-12 gap-4 rounded-lg border p-4 shadow-sm'
              >
                <div className='col-span-3'>
                  <div className='font-medium'>{request.userName}</div>
                  <div className='text-xs text-muted-foreground'>
                    {request.department || 'No department'}
                  </div>
                </div>
                <div className='col-span-2'>
                  <div>{request.leaveType}</div>
                  {request.halfDay && (
                    <span className='text-xs text-muted-foreground'>Half Day</span>
                  )}
                </div>
                <div className='col-span-3'>
                  <span className='text-sm'>
                    {format(new Date(request.startDate), 'MMM dd')} -{' '}
                    {format(new Date(request.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className='col-span-2'>
                  <Badge variant='secondary' className={getStatusBadgeColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
                <div className='col-span-2 flex items-center justify-end gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleViewDetails(request)}
                    className='flex h-8 w-8 items-center justify-center p-0'
                  >
                    <Search className='h-4 w-4' />
                  </Button>

                  {isPendingRequest(request) && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleOpenStatusDialog(request)}
                    >
                      Update
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leave Request Details Dialog */}
        {selectedRequest && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Leave Request Details</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Employee</p>
                    <p className='font-medium'>{selectedRequest.userName}</p>
                    <p className='text-xs text-muted-foreground'>
                      {selectedRequest.department || 'No department'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Status</p>
                    <Badge
                      variant='secondary'
                      className={getStatusBadgeColor(selectedRequest.status)}
                    >
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Leave Type</p>
                    <p className='font-medium'>{selectedRequest.leaveType}</p>
                    {selectedRequest.halfDay && (
                      <span className='text-xs text-muted-foreground'>Half Day</span>
                    )}
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Date Range</p>
                    <p className='font-medium'>
                      {format(new Date(selectedRequest.startDate), 'MMM dd')} -{' '}
                      {format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>Reason</p>
                  <p className='mt-1 rounded-md bg-muted p-3 text-sm'>{selectedRequest.reason}</p>
                </div>

                {selectedRequest.adminComment && (
                  <div>
                    <p className='text-sm text-muted-foreground'>Admin Comment</p>
                    <p className='mt-1 rounded-md bg-muted p-3 text-sm'>
                      {selectedRequest.adminComment}
                    </p>
                  </div>
                )}

                <div className='flex justify-between'>
                  <p className='text-sm text-muted-foreground'>
                    Requested on {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy')}
                  </p>

                  {selectedRequest.documentUrl && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDownloadDocument(selectedRequest)}
                      className='flex items-center gap-1'
                    >
                      <Download className='h-4 w-4' />
                      Download Document
                    </Button>
                  )}
                </div>

                {isPendingRequest(selectedRequest) && (
                  <div className='flex justify-end'>
                    <Button
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        handleOpenStatusDialog(selectedRequest);
                      }}
                    >
                      Update Status
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Status Update Dialog */}
        {selectedRequest && (
          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Update Leave Request Status</DialogTitle>
              </DialogHeader>
              <Form {...statusForm}>
                <form onSubmit={statusForm.handleSubmit(handleUpdateStatus)} className='space-y-4'>
                  <div className='space-y-2'>
                    <p className='font-medium'>{selectedRequest.userName}</p>
                    <p className='text-sm text-muted-foreground'>
                      {selectedRequest.leaveType} Leave:{' '}
                      {format(new Date(selectedRequest.startDate), 'MMM dd')} -{' '}
                      {format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <FormField
                    control={statusForm.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Decision</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select decision' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='APPROVED'>Approve</SelectItem>
                            <SelectItem value='REJECTED'>Reject</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={statusForm.control}
                    name='adminComment'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comment (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Add a comment to the employee about this decision'
                            className='h-20'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsStatusDialogOpen(false)}
                      disabled={isUpdatingStatus}
                    >
                      Cancel
                    </Button>
                    <Button type='submit' disabled={isUpdatingStatus}>
                      {isUpdatingStatus ? (
                        <span className='flex items-center gap-2'>
                          <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'></span>
                          Updating...
                        </span>
                      ) : (
                        'Update Status'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLeaveRequests;
