
/**
 * GOOGLE APPS SCRIPT CODE
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the script editor and paste this code.
 * 4. Rename the default file from 'Code.gs' to 'code.js' if you prefer, or keep it as Code.gs.
 * 5. Ensure you have two sheets named exactly "Data" and "SchoolList".
 * 6. "SchoolList" columns should be: Udise Code, School Name, Nyay Panchayat, School Type.
 * 7. "Data" columns should match the structure described in your prompt.
 * 8. Click 'Deploy' > 'New Deployment'.
 * 9. Select 'Web App'.
 * 10. Execute as: 'Me'.
 * 11. Who has access: 'Anyone'.
 * 12. Copy the Web App URL and paste it into `services/gasService.ts`.
 */

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'getSchool') {
    return getSchoolData(e.parameter.code);
  }
  
  return createJsonResponse({ success: false, error: 'Invalid action' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === 'saveData') {
      return saveEnrollmentData(data);
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function getSchoolData(udiseCode) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('SchoolList');
  if (!sheet) return createJsonResponse({ success: false, error: 'SchoolList sheet not found' });
  
  var values = sheet.getDataRange().getValues();
  // Assume Row 1 is header
  for (var i = 1; i < values.length; i++) {
    // Column 0 = Udise Code
    if (values[i][0].toString().trim() === udiseCode.toString().trim()) {
      return createJsonResponse({
        success: true,
        data: {
          udiseCode: values[i][0].toString(),
          schoolName: values[i][1],
          nyayPanchayat: values[i][2],
          schoolType: values[i][3]
        }
      });
    }
  }
  
  return createJsonResponse({ success: false, error: 'School not found' });
}

function saveEnrollmentData(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Data');
  if (!sheet) return createJsonResponse({ success: false, error: 'Data sheet not found' });
  
  // Columns in Data sheet based on requirements:
  // 0: Udise Code, 1: School Name, 2: Nyay Panchayat, 3: School Type, 
  // 4: Class 6 Enrolled, 5: Class 6 Registration, 
  // 6: Class 7 Enrolled, 7: Class 7 Registration, 
  // 8: Class 8 Enrolled, 9: Class 8 Registration, 
  // 10: Total Enrolled, 11: Total Registration, 12: Registration Percentage
  
  var row = [
    payload.udiseCode,
    payload.schoolName,
    payload.nyayPanchayat,
    payload.schoolType,
    payload.class6.enrolled,
    payload.class6.registration,
    payload.class7.enrolled,
    payload.class7.registration,
    payload.class8.enrolled,
    payload.class8.registration,
    payload.totalEnrolled,
    payload.totalRegistration,
    payload.registrationPercentage
  ];
  
  sheet.appendRow(row);
  
  return createJsonResponse({ success: true, data: 'Row added' });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
