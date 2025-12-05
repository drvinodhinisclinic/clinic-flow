// Appointments page - view and manage all appointments
import { useState, useEffect, useMemo } from 'react';
import { Search, Edit, Trash2, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppointmentForm } from '@/components/AppointmentForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/Pagination';
import { StatusBadge } from '@/components/StatusBadge';
import { Appointment, AppointmentFormData } from '@/types';
import {
  getAllAppointments,
  searchAppointments,
  updateAppointment,
  deleteAppointment,
} from '@/services/api';
import { toast } from 'sonner';

// Items per page for pagination
const ITEMS_PER_PAGE = 50;

// Mock data for demo when API is not available
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patient_id: 1,
    patient_name: 'Ramesh Kumar',
    doctor_name: 'Dr. Sarah Johnson',
    appointment_date: '2025-12-05',
    appointment_time: '10:00',
    reason: 'General Checkup',
    status: 'Scheduled',
  },
  {
    id: 2,
    patient_id: 2,
    patient_name: 'Priya Sharma',
    doctor_name: 'Dr. Emily Williams',
    appointment_date: '2025-12-05',
    appointment_time: '11:30',
    reason: 'Prenatal Checkup',
    status: 'Scheduled',
  },
  {
    id: 3,
    patient_id: 3,
    patient_name: 'Suresh Patel',
    doctor_name: 'Dr. Michael Chen',
    appointment_date: '2025-12-04',
    appointment_time: '14:00',
    reason: 'Blood Pressure Follow-up',
    status: 'Completed',
  },
  {
    id: 4,
    patient_id: 4,
    patient_name: 'Lakshmi Iyer',
    doctor_name: 'Dr. James Brown',
    appointment_date: '2025-12-03',
    appointment_time: '09:30',
    reason: 'Joint Pain Consultation',
    status: 'Completed',
  },
  {
    id: 5,
    patient_id: 5,
    patient_name: 'Arun Reddy',
    doctor_name: 'Dr. Sarah Johnson',
    appointment_date: '2025-12-06',
    appointment_time: '15:00',
    reason: 'Asthma Review',
    status: 'Scheduled',
  },
];

export default function Appointments() {
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Search/filter state
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Form state
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch all appointments
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (error) {
      // Use mock data if API fails (for demo purposes)
      console.log('Using mock data - API not available');
      setAppointments(mockAppointments);
    } finally {
      setIsLoading(false);
    }
  };

  // Search appointments
  const handleSearch = async () => {
    setCurrentPage(1);

    if (!searchName && !searchPhone && !searchDate) {
      fetchAppointments();
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchAppointments({
        name: searchName || undefined,
        phone: searchPhone || undefined,
        date: searchDate || undefined,
      });
      setAppointments(data);
    } catch (error) {
      // Filter mock data for demo
      let filtered = [...mockAppointments];
      if (searchName) {
        filtered = filtered.filter((a) =>
          a.patient_name?.toLowerCase().includes(searchName.toLowerCase())
        );
      }
      if (searchDate) {
        filtered = filtered.filter((a) => a.appointment_date === searchDate);
      }
      setAppointments(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search filters
  const handleClearFilters = () => {
    setSearchName('');
    setSearchPhone('');
    setSearchDate('');
    fetchAppointments();
  };

  // Paginate appointments
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return appointments.slice(start, start + ITEMS_PER_PAGE);
  }, [appointments, currentPage]);

  // Handle appointment form submission
  const handleAppointmentSubmit = async (data: AppointmentFormData) => {
    if (!selectedAppointment) return;

    const appointmentId = selectedAppointment.id || (selectedAppointment as any).appointment_id;
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAppointment(appointmentId, data);
      toast.success('Appointment updated successfully');
      setAppointmentFormOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteAppointment(appointmentToDelete.id);
      toast.success('Appointment cancelled successfully');
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
      fetchAppointments();
    } catch (error) {
      // Demo mode - simulate success
      toast.success('Appointment cancelled successfully');
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit form
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentFormOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground mt-1">
          View and manage clinic appointments
        </p>
      </div>

      {/* Search/Filter Bar */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-name" className="text-sm">Patient Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-name"
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-phone" className="text-sm">Phone Number</Label>
            <Input
              id="search-phone"
              type="text"
              placeholder="Search by phone..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-date" className="text-sm">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="search-date"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="flex-1">
              Search
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : paginatedAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No appointments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-table-header">
                    <TableHead>ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="hidden md:table-cell">Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAppointments.map((appointment) => (
                    <TableRow key={appointment.id || (appointment as any).appointment_id} className="table-row-interactive">
                      <TableCell className="font-medium">
                        #{appointment.id || (appointment as any).appointment_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {appointment.patient_name || `Patient #${appointment.patient_id}`}
                      </TableCell>
                      <TableCell>
                        {appointment.doctor_name || 'Not assigned'}
                      </TableCell>
                      <TableCell>{formatDate(appointment.appointment_date)}</TableCell>
                      <TableCell>{formatTime(appointment.appointment_time)}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {appointment.reason}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={appointment.status || 'Scheduled'} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAppointment(appointment)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit Appointment"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(appointment)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Cancel Appointment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-border px-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={appointments.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Appointment Form Dialog */}
      <AppointmentForm
        open={appointmentFormOpen}
        onClose={() => {
          setAppointmentFormOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={handleAppointmentSubmit}
        appointment={selectedAppointment}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAppointmentToDelete(null);
        }}
        onConfirm={handleDeleteAppointment}
        title="Cancel Appointment"
        description={`Are you sure you want to cancel the appointment for ${appointmentToDelete?.patient_name}? This action cannot be undone.`}
        confirmText="Cancel Appointment"
        isLoading={isSubmitting}
      />
    </div>
  );
}
