// Patient type definition
export interface Patient {
  id: number;
  name: string;
  age: string;
  gender: string;
  dateofbirth: string;
  BloodGroup: string;
  mobile: string;
  address: string;
  allergies: string;
  medical_history: string;
  isANC: string;
  EDD: string | null;
  created_at?: string;
}

// Appointment type definition
export interface Appointment {
  id: number;
  patient_id: number;
  patient_name?: string;
  doctor_name?: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status?: string;
  created_at?: string;
}

// Form data types
export interface PatientFormData {
  name: string;
  age: string;
  gender: string;
  dateofbirth: string;
  BloodGroup: string;
  mobile: string;
  address: string;
  allergies: string;
  medical_history: string;
  isANC: string;
  EDD: string | null;
}

export interface AppointmentFormData {
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
