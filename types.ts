
export interface SchoolInfo {
  udiseCode: string;
  schoolName: string;
  nyayPanchayat: string;
  schoolType: string;
}

export interface ClassData {
  enrolled: number;
  registration: number;
}

export interface EnrollmentPayload {
  udiseCode: string;
  schoolName: string;
  nyayPanchayat: string;
  schoolType: string;
  class6: ClassData;
  class7: ClassData;
  class8: ClassData;
  totalEnrolled: number;
  totalRegistration: number;
  registrationPercentage: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
