import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TeamMemberLeave {
  name: string;
  startDate: Date;
  endDate: Date;
}

interface Holiday {
  name: string;
  date: Date;
}

// Example data - replace with actual API calls
const holidays: Holiday[] = [
  { name: 'New Year', date: new Date('2025-01-01') },
  { name: 'Memorial Day', date: new Date('2025-05-26') },
  { name: 'Independence Day', date: new Date('2025-07-04') },
];

const teamLeaves: TeamMemberLeave[] = [
  {
    name: 'John Doe',
    startDate: new Date('2025-04-25'),
    endDate: new Date('2025-04-28'),
  },
  {
    name: 'Jane Smith',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-05'),
  },
];

export function TeamCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const isHoliday = (date: Date) => {
    return holidays.some((holiday) => holiday.date.toDateString() === date.toDateString());
  };

  const getTeamMembersOnLeave = (date: Date) => {
    return teamLeaves.filter((leave) => date >= leave.startDate && date <= leave.endDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={setSelectedDate}
            className={cn('rounded-md border pointer-events-auto')}
            modifiers={{
              holiday: (date) => isHoliday(date),
              teamLeave: (date) => getTeamMembersOnLeave(date).length > 0,
            }}
            modifiersStyles={{
              holiday: { backgroundColor: '#FFDEE2' }, // Light red
              teamLeave: { backgroundColor: '#D1FAE5' }, // Light green (tailwind green-100)
            }}
          />

          <div className='space-y-2 min-h-[60px]'>
            {' '}
            {/* Added min-height */}
            {selectedDate && (
              <>
                {isHoliday(selectedDate) && (
                  <div>
                    <h4 className='text-sm font-medium mb-1'>Public Holiday:</h4>
                    <Badge
                      variant='destructive'
                      className='bg-red-100 text-red-700 hover:bg-red-100'
                    >
                      {
                        holidays.find((h) => h.date.toDateString() === selectedDate.toDateString())
                          ?.name
                      }
                    </Badge>
                  </div>
                )}

                {getTeamMembersOnLeave(selectedDate).length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium mb-1'>Team Members on Leave:</h4>
                    <div className='space-y-1'>
                      {getTeamMembersOnLeave(selectedDate).map((leave) => (
                        <Badge
                          key={leave.name}
                          variant='secondary'
                          className='bg-green-100 text-green-700 hover:bg-green-100 mr-1 mb-1' // Added margin
                        >
                          {leave.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
