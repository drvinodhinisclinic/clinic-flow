// Patient form component for creating and editing patients
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Patient, PatientFormData } from '@/types';
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

// Validation schema for patient form
const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  dateofbirth: z.string().min(1, 'Date of birth is required'),
  BloodGroup: z.string().min(1, 'Blood group is required'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').max(15),
  address: z.string().min(5, 'Address must be at least 5 characters').max(255),
  allergies: z.string().max(500).optional(),
  medical_history: z.string().max(1000).optional(),
  isANC: z.string(),
  EDD: z.string().nullable().optional(),
});

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  patient?: Patient | null;
  isLoading?: boolean;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

// Helper to format date for input field
const formatDateForInput = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
};

export function PatientForm({
  open,
  onClose,
  onSubmit,
  patient,
  isLoading,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: '',
      dateofbirth: '',
      BloodGroup: '',
      mobile: '',
      address: '',
      allergies: '',
      medical_history: '',
      isANC: 'No',
      EDD: null,
    },
  });

  // Reset form with patient data when dialog opens or patient changes
  useEffect(() => {
    if (open) {
      if (patient) {
        reset({
          name: patient.name || '',
          age: patient.age || '',
          gender: patient.gender || '',
          dateofbirth: formatDateForInput(patient.dateofbirth),
          BloodGroup: patient.BloodGroup || '',
          mobile: patient.mobile || '',
          address: patient.address || '',
          allergies: patient.allergies || '',
          medical_history: patient.medical_history || '',
          isANC: patient.isANC || 'No',
          EDD: formatDateForInput(patient.EDD),
        });
      } else {
        reset({
          name: '',
          age: '',
          gender: '',
          dateofbirth: '',
          BloodGroup: '',
          mobile: '',
          address: '',
          allergies: '',
          medical_history: '',
          isANC: 'No',
          EDD: null,
        });
      }
    }
  }, [open, patient, reset]);

  const isANC = watch('isANC');

  const handleFormSubmit = async (data: PatientFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
          <DialogDescription>
            {patient ? 'Update the patient details below.' : 'Fill in the details to add a new patient.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter patient name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                {...register('mobile')}
                placeholder="Enter mobile number"
                className={errors.mobile ? 'border-destructive' : ''}
              />
              {errors.mobile && (
                <p className="text-xs text-destructive">{errors.mobile.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                {...register('age')}
                placeholder="Enter age"
                className={errors.age ? 'border-destructive' : ''}
              />
              {errors.age && (
                <p className="text-xs text-destructive">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateofbirth">Date of Birth *</Label>
              <Input
                id="dateofbirth"
                type="date"
                {...register('dateofbirth')}
                className={errors.dateofbirth ? 'border-destructive' : ''}
              />
              {errors.dateofbirth && (
                <p className="text-xs text-destructive">{errors.dateofbirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={watch('gender')}
                onValueChange={(value) => setValue('gender', value)}
              >
                <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="BloodGroup">Blood Group *</Label>
              <Select
                value={watch('BloodGroup')}
                onValueChange={(value) => setValue('BloodGroup', value)}
              >
                <SelectTrigger className={errors.BloodGroup ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.BloodGroup && (
                <p className="text-xs text-destructive">{errors.BloodGroup.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter full address"
              rows={2}
              className={errors.address ? 'border-destructive' : ''}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                {...register('allergies')}
                placeholder="List any allergies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Medical History</Label>
              <Input
                id="medical_history"
                {...register('medical_history')}
                placeholder="Enter medical history"
              />
            </div>
          </div>

          {/* ANC Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isANC">Is ANC Patient?</Label>
              <Select
                value={watch('isANC')}
                onValueChange={(value) => setValue('isANC', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isANC === 'Yes' && (
              <div className="space-y-2">
                <Label htmlFor="EDD">Expected Delivery Date (EDD)</Label>
                <Input
                  id="EDD"
                  type="date"
                  {...register('EDD')}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : patient ? 'Update Patient' : 'Add Patient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
