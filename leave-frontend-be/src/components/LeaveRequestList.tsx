import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, Search, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define the type based on backend's LeaveRequestResponseDto (similar to Dashboard)
type LeaveRequest = {
  id: number;
  userId: number;
  userFullName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  comment: string | null; // Add comment field based on readme
  uploadedDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const LeaveRequestList = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<LeaveRequest[]>('/leave/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocument = async (request: LeaveRequest) => {
    if (!request.uploadedDocumentUrl) {
      toast.error('No document available for download');
      return;
    }
    try {
      // Construct the full URL assuming uploadedDocumentUrl is like /api/v1/leave/files/...
      // And the base URL is already handled by axiosInstance or known
      const baseUrl =
        axiosInstance.defaults.baseURL?.replace('/api/v1', '') || 'http://localhost:8080'; // Get base URL
      const fullUrl = `${baseUrl}${request.uploadedDocumentUrl}`;

      // Open the URL in a new tab - browser handles download
      window.open(fullUrl, '_blank');

      // No need for toast here, browser handles feedback
      // toast.success('Document download started');

      // Original attempt (might work if backend serves blobs directly via this URL + auth)
      // const response = await axiosInstance.get(request.uploadedDocumentUrl, { responseType: 'blob' });
      // const blob = new Blob([response.data], { type: response.headers['content-type'] });
      // const link = document.createElement('a');
      // link.href = window.URL.createObjectURL(blob);
      // const contentDisposition = response.headers['content-disposition'];
      // let filename = `leave-document-${request.id}.pdf`; // default
      // if (contentDisposition) {
      //   const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      //   if (filenameMatch && filenameMatch.length === 2)
      //     filename = filenameMatch[1];
      // }
      // link.download = filename;
      // link.click();
      // window.URL.revokeObjectURL(link.href);
      // toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const filteredRequests = requests.filter((request) => {
    if (activeTab === 'all') return true;
    return request.status === activeTab.toUpperCase();
  });

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

  return (
    <Card>
      <CardHeader className='flex flex-col space-y-1.5'>
        <div className='flex items-center justify-between'>
          <CardTitle>My Leave Requests</CardTitle>
          <Button asChild>
            <Link to='/leave-requests/new'>New Request</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='mb-4'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='pending'>Pending</TabsTrigger>
            <TabsTrigger value='approved'>Approved</TabsTrigger>
            <TabsTrigger value='rejected'>Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-0'>
            {isLoading ? (
              <div className='flex h-40 items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className='flex h-40 flex-col items-center justify-center text-center'>
                <FileText className='mb-2 h-10 w-10 text-muted-foreground' />
                <h3 className='font-medium'>No Leave Requests</h3>
                <p className='mt-1 text-sm text-muted-foreground'>
                  You haven't made any leave requests yet.
                </p>
                <Button asChild className='mt-4'>
                  <Link to='/leave-requests/new'>Create Request</Link>
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className='flex flex-col justify-between rounded-lg border p-4 shadow-sm md:flex-row md:items-center'
                  >
                    <div className='mb-4 md:mb-0'>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium'>{request.leaveType} Leave</h3>
                        <Badge variant='secondary' className={getStatusBadgeColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div className='mt-1 flex items-center text-sm text-muted-foreground'>
                        <Calendar className='mr-1 h-3 w-3' />
                        <span>
                          {format(new Date(request.startDate), 'MMM dd, yyyy')} -{' '}
                          {format(new Date(request.endDate), 'MMM dd, yyyy')}
                        </span>
                        {request.halfDay && <span className='ml-2 text-xs'>(Half Day)</span>}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {request.uploadedDocumentUrl && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDownloadDocument(request)}
                          className='flex items-center gap-1'
                        >
                          <Download className='h-3 w-3' />
                          <span className='hidden md:inline'>Document</span>
                        </Button>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleViewDetails(request)}
                        className='flex items-center gap-1'
                      >
                        <Search className='h-3 w-3' />
                        <span className='hidden md:inline'>Details</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Leave Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Leave Type</p>
                  <p className='font-medium'>{selectedRequest.leaveType} Leave</p>
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

              <div>
                <p className='text-sm text-muted-foreground'>Date Range</p>
                <p className='font-medium'>
                  {format(new Date(selectedRequest.startDate), 'MMMM d, yyyy')} -{' '}
                  {format(new Date(selectedRequest.endDate), 'MMMM d, yyyy')}
                  {selectedRequest.halfDay && ' (Half Day)'}
                </p>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Reason</p>
                <p className='mt-1 rounded-md bg-muted p-3 text-sm'>{selectedRequest.reason}</p>
              </div>

              {selectedRequest.comment && (
                <div>
                  <p className='text-sm text-muted-foreground'>Comment</p>
                  <p className='mt-1 rounded-md bg-muted p-3 text-sm'>{selectedRequest.comment}</p>
                </div>
              )}

              <div className='flex justify-between'>
                <p className='text-sm text-muted-foreground'>
                  Requested on {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy')}
                </p>

                {selectedRequest.uploadedDocumentUrl && (
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default LeaveRequestList;
