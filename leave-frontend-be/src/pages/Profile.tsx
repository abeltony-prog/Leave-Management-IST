import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();

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
              {user.profilePictureUrl ? (
                <AvatarImage src={user.profilePictureUrl} alt={user.name} />
              ) : (
                <AvatarFallback className='text-2xl'>{getInitials(user.name)}</AvatarFallback>
              )}
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
            variant='destructive'
            onClick={logout}
            className='mt-4 flex w-full items-center gap-2 md:w-auto'
          >
            <LogOut className='h-4 w-4' />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
