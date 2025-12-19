
import { SchoolInfo, EnrollmentPayload, ApiResponse } from '../types';

/**
 * Replace this with your actual Google Apps Script Deployment URL
 * after you deploy your script as a Web App.
 */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbySlf2xSrfhGw9AypQq7oFDj5ugRygSs__lM2D5KlzTRbbaCrWkUQohvXYgkpr0y5CYdg/exec';

export const fetchSchoolInfo = async (udiseCode: string): Promise<ApiResponse<SchoolInfo>> => {
  try {
    const response = await fetch(`${GAS_URL}?action=getSchool&code=${udiseCode}`);
    if (!response.ok) throw new Error('Failed to fetch school info');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: 'Could not fetch school details. Please check the UDISE code.' };
  }
};

export const submitEnrollmentData = async (payload: EnrollmentPayload): Promise<ApiResponse<string>> => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'saveData', ...payload }),
    });
    if (!response.ok) throw new Error('Failed to submit data');
    return await response.json();
  } catch (error) {
    console.error('Submit error:', error);
    return { success: false, error: 'Could not save data. Please try again later.' };
  }
};
