// Appointment form component for booking and editing appointments
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Appointment, AppointmentFormData, Patient, Doctor } from '@/types';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { getAllDoctors } from '@/services/api';
import { Loader2 } from 'lucide-react';

// Validation schema for appointment form
const appointmentSchema = z.object({
  patient_id: z.number().min(1, 'Patient is required'),
  doctor_id: z.number().min(1, 'Doctor is required'),
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

// Mock doctors for fallback
const mockDoctors: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Johnson' },
  { id: 2, name: 'Dr. Michael Chen' },
  { id: 3, name: 'Dr. Emily Williams' },
  { id: 4, name: 'Dr. James Brown' },
];

const statuses = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];

// Generate 5-minute interval time slots from 9:00 AM to 6:00 PM
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      if (hour === 18 && minute > 0) break; // Stop at 18:00
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export function AppointmentForm({
  open,
  onClose,
  onSubmit,
  appointment,
  patient,
  isLoading,
}: AppointmentFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: patient?.id || 0,
      doctor_id: undefined,
      appointment_date: '',
      appointment_time: '',
      reason: '',
      status: 'Scheduled',
    },
  });

  // Fetch doctors when dialog opens
  useEffect(() => {
    if (open) {
      fetchDoctors();
    }
  }, [open]);

  // Reset form when appointment or patient changes
  useEffect(() => {
    if (open) {
      if (appointment) {
        reset({
          patient_id: appointment.patient_id,
          doctor_id: undefined,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          reason: appointment.reason,
          status: appointment.status || 'Scheduled',
        });
      } else {
        reset({
          patient_id: patient?.id || 0,
          doctor_id: undefined,
          appointment_date: '',
          appointment_time: '',
          reason: '',
          status: 'Scheduled',
        });
      }
    }
  }, [open, appointment, patient, reset]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await getAllDoctors();
      setDoctors(data);
    } catch (error) {
      console.log('Using mock doctors - API not available');
      setDoctors(mockDoctors);
    } finally {
      setLoadingDoctors(false);
    }
  };

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
          <DialogDescription>
            {appointment ? 'Update the appointment details below.' : 'Fill in the details to book a new appointment.'}
          </DialogDescription>
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
            {loadingDoctors ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading doctors...</span>
              </div>
            ) : (
              <Select
                value={watch('doctor_id')?.toString() || ''}
                onValueChange={(value) => setValue('doctor_id', parseInt(value))}
              >
                <SelectTrigger className={errors.doctor_id ? 'border-destructive' : ''}>
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
            )}
            {errors.doctor_id && (
              <p className="text-xs text-destructive">{errors.doctor_id.message}</p>
            )}
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
              <SelectContent className="max-h-60">
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
            <Button type="submit" disabled={isLoading || loadingDoctors}>
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