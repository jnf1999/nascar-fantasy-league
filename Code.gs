// NASCAR Fantasy League - Google Apps Script Backend
// This script provides a REST API for the NASCAR Fantasy League app using Google Sheets as the database

// ==================== CONFIGURATION ====================

const PASSCODE = 'spider2ybanana!'; // Change this to your desired passcode
const SHEET_NAME = 'NASCAR Fantasy League Data';

// ==================== SHEET INITIALIZATION ====================

function getSpreadsheet() {
  const sheets = SpreadsheetApp.getActiveSpreadsheet();
  if (!sheets) {
    throw new Error('No active spreadsheet found');
  }
  return sheets;
}

function initializeSheets() {
  const ss = getSpreadsheet();
  
  // Define sheet configurations
  const sheetConfigs = [
    { name: 'Users', headers: ['User Name', 'Created Date'] },
    { name: 'Active Drivers', headers: ['Driver Name'] },
    { name: 'Races', headers: ['Race ID', 'Name', 'Date', 'Time', 'Track', 'Type'] },
    { name: 'Picks', headers: ['User Name', 'Race ID', 'Driver 1', 'Driver 2', 'Driver 3', 'Timestamp'] },
    { name: 'Race Results', headers: ['Race ID', 'Driver Name', 'Points'] },
    { name: 'Bonus Points', headers: ['Race ID', 'User Name', 'Bonus Points'] },
    { name: 'Historical Data', headers: ['Year', 'Race', 'Track', 'Track Type', 'Driver', 'Points', 'User'] }
  ];
  
  // Create or update sheets
  sheetConfigs.forEach(config => {
    let sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
      sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
      sheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  });
  
  return 'Sheets initialized successfully';
}

// ==================== AUTHENTICATION ====================

function validatePasscode(passcode) {
  return passcode === PASSCODE;
}

// ==================== HELPER FUNCTIONS ====================

function getSheetData(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function appendToSheet(sheetName, values) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  sheet.appendRow(values);
}

function clearSheet(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

function findAndDeleteRow(sheetName, columnIndex, value) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return false;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex] === value) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function updateOrInsertRow(sheetName, keyColumn, keyValue, rowData) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyColumn);
  
  if (keyIndex === -1) throw new Error(`Column ${keyColumn} not found`);
  
  // Find existing row
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] === keyValue) {
      // Update existing row
      const rowValues = headers.map(header => rowData[header] !== undefined ? rowData[header] : data[i][headers.indexOf(header)]);
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowValues]);
      return;
    }
  }
  
  // Insert new row
  const rowValues = headers.map(header => rowData[header] || '');
  sheet.appendRow(rowValues);
}

// ==================== API ENDPOINTS ====================

function getAllData() {
  const data = {
    users: getSheetData('Users').map(row => row['User Name']),
    activeDrivers: getSheetData('Active Drivers').map(row => row['Driver Name']),
    races: [],
    picks: {},
    raceResults: {},
    bonusPoints: {},
    historicalData: []
  };
  
  // Get races
  const racesData = getSheetData('Races');
  data.races = racesData.map(row => ({
    id: row['Race ID'],
    name: row['Name'],
    date: row['Date'],
    time: row['Time'],
    track: row['Track'],
    type: row['Type']
  }));
  
  // Get picks
  const picksData = getSheetData('Picks');
  picksData.forEach(row => {
    const raceKey = `race_${row['Race ID']}`;
    if (!data.picks[raceKey]) data.picks[raceKey] = {};
    data.picks[raceKey][row['User Name']] = [row['Driver 1'], row['Driver 2'], row['Driver 3']];
  });
  
  // Get race results
  const resultsData = getSheetData('Race Results');
  resultsData.forEach(row => {
    const raceKey = `race_${row['Race ID']}`;
    if (!data.raceResults[raceKey]) data.raceResults[raceKey] = {};
    data.raceResults[raceKey][row['Driver Name']] = row['Points'];
  });
  
  // Get bonus points
  const bonusData = getSheetData('Bonus Points');
  bonusData.forEach(row => {
    const raceKey = `race_${row['Race ID']}`;
    if (!data.bonusPoints[raceKey]) data.bonusPoints[raceKey] = {};
    data.bonusPoints[raceKey][row['User Name']] = row['Bonus Points'];
  });
  
  // Get historical data
  data.historicalData = getSheetData('Historical Data');
  
  return data;
}

function addUser(userName) {
  const existing = getSheetData('Users');
  if (existing.some(row => row['User Name'] === userName)) {
    throw new Error('User already exists');
  }
  appendToSheet('Users', [userName, new Date()]);
  return { success: true, message: 'User added' };
}

function removeUser(userName) {
  const deleted = findAndDeleteRow('Users', 0, userName);
  return { success: deleted, message: deleted ? 'User removed' : 'User not found' };
}

function addDriver(driverName) {
  const existing = getSheetData('Active Drivers');
  if (existing.some(row => row['Driver Name'] === driverName)) {
    throw new Error('Driver already exists');
  }
  appendToSheet('Active Drivers', [driverName]);
  return { success: true, message: 'Driver added' };
}

function removeDriver(driverName) {
  const deleted = findAndDeleteRow('Active Drivers', 0, driverName);
  return { success: deleted, message: deleted ? 'Driver removed' : 'Driver not found' };
}

function saveRaces(races) {
  clearSheet('Races');
  races.forEach(race => {
    appendToSheet('Races', [race.id, race.name, race.date, race.time || '', race.track, race.type]);
  });
  return { success: true, message: 'Races saved' };
}

function savePicks(picks) {
  clearSheet('Picks');
  Object.keys(picks).forEach(raceKey => {
    const raceId = raceKey.replace('race_', '');
    const userPicks = picks[raceKey];
    Object.keys(userPicks).forEach(userName => {
      const drivers = userPicks[userName];
      appendToSheet('Picks', [userName, raceId, drivers[0] || '', drivers[1] || '', drivers[2] || '', new Date()]);
    });
  });
  return { success: true, message: 'Picks saved' };
}

function saveResults(raceResults) {
  clearSheet('Race Results');
  Object.keys(raceResults).forEach(raceKey => {
    const raceId = raceKey.replace('race_', '');
    const results = raceResults[raceKey];
    Object.keys(results).forEach(driverName => {
      if (results[driverName]) {
        appendToSheet('Race Results', [raceId, driverName, results[driverName]]);
      }
    });
  });
  return { success: true, message: 'Results saved' };
}

function saveBonusPoints(bonusPoints) {
  clearSheet('Bonus Points');
  Object.keys(bonusPoints).forEach(raceKey => {
    const raceId = raceKey.replace('race_', '');
    const bonuses = bonusPoints[raceKey];
    Object.keys(bonuses).forEach(userName => {
      if (bonuses[userName]) {
        appendToSheet('Bonus Points', [raceId, userName, bonuses[userName]]);
      }
    });
  });
  return { success: true, message: 'Bonus points saved' };
}

function saveHistoricalData(historicalData) {
  clearSheet('Historical Data');
  historicalData.forEach(record => {
    appendToSheet('Historical Data', [
      record.year || '',
      record.race || '',
      record.track || '',
      record.trackType || '',
      record.driver || '',
      record.points || 0,
      record.user || ''
    ]);
  });
  return { success: true, message: 'Historical data saved' };
}

// ==================== WEB APP HANDLERS ====================

function doGet(e) {
  try {
    const params = e.parameter;
    
    // Validate passcode
    if (!validatePasscode(params.passcode)) {
      return createResponse({ error: 'Invalid passcode' }, 401);
    }
    
    const action = params.action;
    
    if (action === 'getAllData') {
      return createResponse(getAllData());
    }
    
    if (action === 'initialize') {
      return createResponse({ message: initializeSheets() });
    }
    
    return createResponse({ error: 'Unknown action' }, 400);
    
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    
    // Validate passcode
    if (!validatePasscode(params.passcode)) {
      return createResponse({ error: 'Invalid passcode' }, 401);
    }
    
    const action = params.action;
    let result;
    
    switch (action) {
      case 'addUser':
        result = addUser(params.userName);
        break;
      case 'removeUser':
        result = removeUser(params.userName);
        break;
      case 'addDriver':
        result = addDriver(params.driverName);
        break;
      case 'removeDriver':
        result = removeDriver(params.driverName);
        break;
      case 'saveRaces':
        result = saveRaces(params.races);
        break;
      case 'savePicks':
        result = savePicks(params.picks);
        break;
      case 'saveResults':
        result = saveResults(params.raceResults);
        break;
      case 'saveBonusPoints':
        result = saveBonusPoints(params.bonusPoints);
        break;
      case 'saveHistoricalData':
        result = saveHistoricalData(params.historicalData);
        break;
      case 'saveAll':
        saveRaces(params.races || []);
        savePicks(params.picks || {});
        saveResults(params.raceResults || {});
        saveBonusPoints(params.bonusPoints || {});
        saveHistoricalData(params.historicalData || []);
        result = { success: true, message: 'All data saved' };
        break;
      default:
        return createResponse({ error: 'Unknown action' }, 400);
    }
    
    return createResponse(result);
    
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function createResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
