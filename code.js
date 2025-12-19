
/**
 * GOOGLE APPS SCRIPT CODE
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the script editor and paste this code.
 * 4. Rename the default file to 'Code.gs'.
 * 5. Ensure you have two sheets named exactly "Data" and "SchoolList".
 * 6. Click 'Deploy' > 'New Deployment'.
 * 7. Select 'Web App'.
 * 8. Execute as: 'Me'.
 * 9. Who has access: 'Anyone'.
 * 10. Copy the Web App URL and paste it into `services/gasService.ts`.
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
  var schoolSheet = ss.getSheetByName('SchoolList');
  var dataSheet = ss.getSheetByName('Data');
  
  if (!schoolSheet) return createJsonResponse({ success: false, error: 'SchoolList sheet not found' });
  
  var schoolValues = schoolSheet.getDataRange().getValues();
  var schoolInfo = null;
  
  // Find basic school info
  for (var i = 1; i < schoolValues.length; i++) {
    if (schoolValues[i][0].toString().trim() === udiseCode.toString().trim()) {
      schoolInfo = {
        udiseCode: schoolValues[i][0].toString(),
        schoolName: schoolValues[i][1],
        nyayPanchayat: schoolValues[i][2],
        schoolType: schoolValues[i][3]
      };
      break;
    }
  }
  
  if (!schoolInfo) {
    return createJsonResponse({ success: false, error: 'School not found in SchoolList' });
  }

  // Check if data already exists in 'Data' sheet
  if (dataSheet) {
    var dataValues = dataSheet.getDataRange().getValues();
    for (var j = 1; j < dataValues.length; j++) {
      if (dataValues[j][0].toString().trim() === udiseCode.toString().trim()) {
        schoolInfo.existingData = {
          class6: { enrolled: Number(dataValues[j][4]) || 0, registration: Number(dataValues[j][5]) || 0 },
          class7: { enrolled: Number(dataValues[j][6]) || 0, registration: Number(dataValues[j][7]) || 0 },
          class8: { enrolled: Number(dataValues[j][8]) || 0, registration: Number(dataValues[j][9]) || 0 }
        };
        break;
      }
    }
  }
  
  return createJsonResponse({ success: true, data: schoolInfo });
}

function saveEnrollmentData(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Data');
  if (!sheet) return createJsonResponse({ success: false, error: 'Data sheet not found' });
  
  var udiseCode = payload.udiseCode.toString().trim();
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  // Find if row already exists for this UDISE code
  for (var i = 1; i < values.length; i++) {
    if (values[i][0].toString().trim() === udiseCode) {
      rowIndex = i + 1; // 1-based index for sheet
      break;
    }
  }
  
  var rowData = [
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
  
  if (rowIndex !== -1) {
    // Update existing row
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    return createJsonResponse({ success: true, data: 'Record updated successfully' });
  } else {
    // Append new row
    sheet.appendRow(rowData);
    return createJsonResponse({ success: true, data: 'Record added successfully' });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
