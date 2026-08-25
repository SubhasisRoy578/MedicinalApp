export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type ConsultationStatus = 'CREATED' | 'IN_PROGRESS' | 'WAITING_FOR_DOCTOR' | 'VERIFIED' | 'COMPLETED';
export type ConsultationMode = 'GENERAL' | 'AYUSH';

export type OCRStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PatientProfile {
  id: number;
  user_id: number;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  emergency_contact?: string;
  address?: string;
  preferred_language?: string;
}

export interface DoctorProfile {
  id: number;
  user_id: number;
  specialization?: string;
  license_number?: string;
  hospital_name?: string;
  department?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  patient_profile?: PatientProfile;
  doctor_profile?: DoctorProfile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Question {
  id: number;
  question_text: string;
  category: string;
  question_type: 'text' | 'choice' | 'multichoice' | 'scale' | 'boolean';
  language: string;
  options?: string[] | null;
  parent_question_id?: number | null;
  trigger_value?: string | null;
  required: boolean;
  order_index: number;
}

export interface Answer {
  id?: number;
  consultation_id?: number;
  question_id?: number | null;
  question_text: string;
  category?: string;
  answer: string;
  answer_type: 'text' | 'voice' | 'quick_button';
  created_at?: string;
}

export interface MedicalReport {
  id: number;
  consultation_id: number;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  ocr_status: OCRStatus;
  ocr_text?: string;
}

export interface ExtractedMedicalInfo {
  id: number;
  consultation_id: number;
  report_id?: number;
  diagnosis: string[];
  medicines: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    raw_line?: string;
  }>;
  test_results: Array<{
    test_name: string;
    result: string;
    unit?: string;
    reference_range?: string;
    flag?: string;
  }>;
  laboratory_values: Record<string, string>;
  procedures: string[];
  surgeries: string[];
  dates: string[];
  doctor_names: string[];
  hospital_names: string[];
  important_findings: string[];
  created_at: string;
}

export interface MedicalSummary {
  id: number;
  consultation_id: number;
  chief_complaint?: string;
  symptoms?: string;
  duration?: string;
  severity?: string;
  past_history?: string;
  medications?: string;
  allergies?: string;
  surgeries?: string;
  family_history?: string;
  investigation_results?: string;
  previous_diagnosis?: string;
  extracted_report_information?: {
    ayush_assessment?: Record<string, string[]>;
    diagnoses?: string[];
    medications?: string[];
    investigations?: string[];
    findings?: string[];
  };
  ai_summary?: string;
  patient_description?: string;
  doctor_notes?: string;
  physical_examination?: string;
  provisional_diagnosis?: string;
  prescription_plan?: string;
  doctor_verified: boolean;
  verified_at?: string;
  verified_by?: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  timestamp: string;
  consultation_id?: number;
  details?: Record<string, any>;
}

export interface Consultation {
  id: number;
  patient_id: number;
  doctor_id?: number | null;
  status: ConsultationStatus;
  started_at: string;
  completed_at?: string | null;
  consent_given: boolean;
  consent_timestamp?: string | null;
  language: string;
  summary_status: string;
  created_at: string;
  patient?: User;
  doctor?: User;
  reports_count?: number;
  answers_count?: number;
  doctor_verified?: boolean;
  answers?: Answer[];
  reports?: MedicalReport[];
  extracted_info?: ExtractedMedicalInfo[];
  summary?: MedicalSummary;
}

export interface AdminStats {
  total_users: number;
  total_patients: number;
  total_doctors: number;
  total_consultations: number;
  pending_reviews: number;
  verified_consultations: number;
  completed_consultations: number;
  total_reports_processed: number;
}
