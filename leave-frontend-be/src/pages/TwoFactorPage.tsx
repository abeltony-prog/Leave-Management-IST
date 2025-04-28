import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({ code: z.string().regex(/^[0-9]{6}$/, 'Invalid 6-digit code') });
type FormValues = z.infer<typeof schema>;

const TwoFactorPage = () => {
  const navigate = useNavigate();
  const { twoFactorPending, verifyTwoFactor, isLoading } = useAuth();

  // Redirect back to login if 2FA not pending
  useEffect(() => {
    if (!twoFactorPending) {
      navigate('/login');
    }
  }, [twoFactorPending, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  const onSubmit = (values: FormValues) => {
    verifyTwoFactor(parseInt(values.code, 10));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Two-Factor Authentication</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit code from your Authenticator app.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication Code</FormLabel>
                  <FormControl>
                    <Input maxLength={6} {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TwoFactorPage; 