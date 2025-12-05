// API service for patient and appointment management
import { Patient, Appointment, PatientFormData, AppointmentFormData, Doctor } from '@/types';

// Base API URL - configure this based on your backend
const API_BASE_URL = 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  console.log(`[API] Fetching: ${url}`);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    console.log(`[API] Response status: ${response.status} for ${url}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API] Error response body:`, errorBody);
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // Response wasn't JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
}

// ============ Patient API Services ============

// Get all patients
export async function getAllPatients(): Promise<Patient[]> {
  return fetchApi<Patient[]>('/patients');
}

// Get patient by ID
export async function getPatientById(id: number): Promise<Patient> {
  return fetchApi<Patient>(`/patients/${id}`);
}

// Search patients by name or phone
export async function searchPatients(query: string): Promise<Patient[]> {
  return fetchApi<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`);
}

// Create new patient
export async function createPatient(data: PatientFormData): Promise<Patient> {
  return fetchApi<Patient>('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update patient
export async function updatePatient(id: number, data: PatientFormData): Promise<Patient> {
  return fetchApi<Patient>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Delete patient
export async function deletePatient(id: number): Promise<void> {
  return fetchApi<void>(`/patients/${id}`, {
    method: 'DELETE',
  });
}

// ============ Doctor API Services ============

// Get all doctors
export async function getAllDoctors(): Promise<Doctor[]> {
  return fetchApi<Doctor[]>('/doctors');
}

// ============ Appointment API Services ============

// Get all appointments
export async function getAllAppointments(): Promise<Appointment[]> {
  return fetchApi<Appointment[]>('/appointments/all');
}

// Get appointment by ID
export async function getAppointmentById(id: number): Promise<Appointment> {
  return fetchApi<Appointment>(`/appointments/${id}`);
}

// Search appointments by name, phone, or date
export async function searchAppointments(params: {
  name?: string;
  phone?: string;
  date?: string;
}): Promise<Appointment[]> {
  const queryParams = new URLSearchParams();
  if (params.name) queryParams.append('name', params.name);
  if (params.phone) queryParams.append('phone', params.phone);
  if (params.date) queryParams.append('date', params.date);
  
  return fetchApi<Appointment[]>(`/appointments/search?${queryParams.toString()}`);
}

// Create new appointment
export async function createAppointment(data: AppointmentFormData): Promise<Appointment> {
  return fetchApi<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update appointment
export async function updateAppointment(
  id: number,
  data: AppointmentFormData
): Promise<Appointment> {
  // Only send the fields expected by the API
  const updatePayload = {
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    reason: data.reason,
    status: data.status,
  };
  return fetchApi<Appointment>(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatePayload),
  });
}

// Delete appointment
export async function deleteAppointment(id: number): Promise<void> {
  return fetchApi<void>(`/appointments/${id}`, {
    method: 'DELETE',
  });
}
