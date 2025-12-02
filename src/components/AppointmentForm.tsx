// Appointment form component for booking and editing appointments
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Appointment, AppointmentFormData, Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Validation schema for appointment form
const appointmentSchema = z.object({
  patient_id: z.number().min(1, 'Patient is required'),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.string().min(1, 'Time is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500),
  status: z.string().optional(),
});

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  appointment?: Appointment | null;
  patient?: Patient | null;
  isLoading?: boolean;
}

// Mock doctors list - in production, this would come from an API
const doctors = [
  { id: 1, name: 'Dr. Sarah Johnson' },
  { id: 2, name: 'Dr. Michael Chen' },
  { id: 3, name: 'Dr. Emily Williams' },
  { id: 4, name: 'Dr. James Brown' },
];

const statuses = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export function AppointmentForm({
  open,
  onClose,
  onSubmit,
  appointment,
  patient,
  isLoading,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment
      ? {
          patient_id: appointment.patient_id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          reason: appointment.reason,
          status: appointment.status || 'Scheduled',
        }
      : {
          patient_id: patient?.id || 0,
          appointment_date: '',
          appointment_time: '',
          reason: '',
          status: 'Scheduled',
        },
  });

  const handleFormSubmit = async (data: AppointmentFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {appointment ? 'Edit Appointment' : 'Book Appointment'}
          </DialogTitle>
        </DialogHeader>

        {/* Show patient info if booking for specific patient */}
        {patient && !appointment && (
          <div className="bg-accent/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-muted-foreground">Booking for:</p>
            <p className="font-medium">{patient.name}</p>
            <p className="text-sm text-muted-foreground">{patient.mobile}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label>Doctor *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="appointment_date">Date *</Label>
            <Input
              id="appointment_date"
              type="date"
              min={today}
              {...register('appointment_date')}
              className={errors.appointment_date ? 'border-destructive' : ''}
            />
            {errors.appointment_date && (
              <p className="text-xs text-destructive">
                {errors.appointment_date.message}
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Time *</Label>
            <Select
              value={watch('appointment_time')}
              onValueChange={(value) => setValue('appointment_time', value)}
            >
              <SelectTrigger
                className={errors.appointment_time ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.appointment_time && (
              <p className="text-xs text-destructive">
                {errors.appointment_time.message}
              </p>
            )}
          </div>

          {/* Status (only for editing) */}
          {appointment && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Describe the reason for appointment"
              rows={3}
              className={errors.reason ? 'border-destructive' : ''}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : appointment
                ? 'Update Appointment'
                : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
