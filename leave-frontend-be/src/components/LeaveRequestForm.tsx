import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

const leaveFormSchema = z
  .object({
    leaveType: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID', 'OTHER'] as const, {
      required_error: 'Please select a leave type',
    }),
    startDate: z.date({
      required_error: 'Please select a start date',
    }),
    endDate: z.date({
      required_error: 'Please select an end date',
    }),
    halfDay: z.boolean().default(false),
    reason: z
      .string()
      .min(10, 'Reason must be at least 10 characters')
      .max(500, 'Reason must not exceed 500 characters'),
    document: z
      .instanceof(File)
      .refine((file) => file.size === 0 || file.size <= MAX_FILE_SIZE, {
        message: 'File size must be less than 5MB',
      })
      .refine((file) => file.size === 0 || ACCEPTED_FILE_TYPES.includes(file.type), {
        message: 'Only .jpg, .jpeg, .png and .pdf files are accepted',
      })
      .optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date cannot be earlier than start date',
    path: ['endDate'],
  });

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

const LeaveRequestForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveType: undefined,
      startDate: undefined,
      endDate: undefined,
      halfDay: false,
      reason: '',
    },
  });

  const onSubmit = async (data: LeaveFormValues) => {
    setIsSubmitting(true);
    try {
      // Format dates
      const formattedStartDate = format(data.startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(data.endDate, 'yyyy-MM-dd');

      // Create FormData
      const formData = new FormData();

      // Append JSON part for leave request details
      const requestDetails = {
        leaveType: data.leaveType,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        halfDay: data.halfDay,
        reason: data.reason,
      };
      formData.append(
        'request',
        new Blob([JSON.stringify(requestDetails)], { type: 'application/json' }),
      );

      // Append optional document
      if (data.document && data.document.size > 0) {
        formData.append('document', data.document, data.document.name);
      }

      await axiosInstance.post('/leave/requests', formData, {
        headers: {
          // Content-Type is set automatically by Axios for FormData
        },
      });

      toast.success('Leave request submitted successfully');
      navigate('/leave-requests');
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      // Error toast is handled by the axios interceptor
      // toast.error('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('document', file);
      setFileName(file.name);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Leave Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='leaveType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select leave type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ANNUAL'>Annual Leave</SelectItem>
                        <SelectItem value='SICK'>Sick Leave</SelectItem>
                        <SelectItem value='PERSONAL'>Personal Leave</SelectItem>
                        <SelectItem value='UNPAID'>Unpaid Leave</SelectItem>
                        <SelectItem value='OTHER'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='halfDay'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Half Day</FormLabel>
                      <div className='text-sm text-muted-foreground'>
                        Request for half day leave
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className='p-3 pointer-events-auto'
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues('startDate');
                            return (
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              (startDate && date < startDate)
                            );
                          }}
                          initialFocus
                          className='p-3 pointer-events-auto'
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Please provide a reason for your leave request'
                      className='min-h-[100px]'
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='document'
              render={() => (
                <FormItem>
                  <FormLabel>Supporting Document (Optional)</FormLabel>
                  <FormControl>
                    <div className='grid w-full gap-1.5'>
                      <label
                        htmlFor='document'
                        className='flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center'
                      >
                        <Upload className='mb-2 h-6 w-6 text-muted-foreground' />
                        <div className='text-sm font-medium'>Click to upload or drag and drop</div>
                        <div className='mt-1 text-xs text-muted-foreground'>
                          PDF, JPEG or PNG (max 5MB)
                        </div>
                        {fileName && (
                          <div className='mt-2 rounded-md bg-secondary px-3 py-1 text-sm'>
                            {fileName}
                          </div>
                        )}
                        <Input
                          id='document'
                          type='file'
                          className='hidden'
                          accept='.pdf,.jpg,.jpeg,.png'
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-4'>
              <Button variant='outline' onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className='flex items-center gap-2'>
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'></span>
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm;
