import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { setupTwoFactor, confirmTwoFactorSetup } from '@/services/twoFactorService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import QRCode from 'qrcode';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold tracking-tight'>User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarFallback className='text-2xl'>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <span className='text-xl font-semibold'>{user.name}</span>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>Role</p>
              <p>{user.role}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>Department</p>
              <p>{user.department || 'N/A'}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>Team</p>
              <p>{user.team || 'N/A'}</p>
            </div>
          </div>
          <Button
            variant='secondary'
            onClick={async () => {
              setIs2FALoading(true);
              try {
                const otpAuthUrl = await setupTwoFactor();
                const dataUrl = await QRCode.toDataURL(otpAuthUrl);
                setQrCodeImage(dataUrl);
                setIsDialogOpen(true);
              } catch (error) {
                console.error('Failed to setup 2FA:', error);
              } finally {
                setIs2FALoading(false);
              }
            }}
            disabled={is2FALoading}
            className='mt-2'
          >
            {is2FALoading ? 'Generating QR…' : 'Enable Two-Factor'}
          </Button>
          <Button
            variant='destructive'
            onClick={logout}
            className='mt-4 flex w-full items-center gap-2 md:w-auto'
          >
            <LogOut className='h-4 w-4' />
            Logout
          </Button>
        </CardContent>
      </Card>
      {qrCodeImage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan to Enable 2FA</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col items-center gap-4'>
              <img src={qrCodeImage!} alt='2FA QR Code' className='w-48 h-48' />
              <p className='text-sm text-center'>
                Scan this QR code in your Authenticator app, then enter the 6-digit code below to complete setup.
              </p>
              <div className='flex flex-col gap-2 w-full max-w-xs'>
                <Input
                  placeholder='Enter 6-digit code'
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={confirmLoading}
                />
                <Button
                  className='w-full'
                  disabled={confirmLoading || otpCode.length !== 6}
                  onClick={async () => {
                    setConfirmLoading(true);
                    try {
                      await confirmTwoFactorSetup(user.email, +otpCode);
                      toast.success('Two-factor authentication enabled');
                      setIsDialogOpen(false);
                    } catch (error) {
                      console.error('Invalid code during setup:', error);
                      toast.error('Invalid code, please try again');
                    } finally {
                      setConfirmLoading(false);
                    }
                  }}
                >
                  {confirmLoading ? 'Verifying...' : 'Confirm'}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProfilePage;
