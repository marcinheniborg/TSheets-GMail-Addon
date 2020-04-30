thisAppSheetID = '127jLhBXVgCG2bJDzGf2Cb_OkgPnlHDItXFPVXbEp9_w'

function myLog(log)
{
//log = 'test';
  Logger.log(log);
  
  //var file = DriveApp.getFileById(thisSheetID);
  
  var spreadsheet = SpreadsheetApp.openById(thisAppSheetID);  
  var sheet = spreadsheet.getSheetByName('log');
  var lastRow = sheet.getLastRow();
  
  var newLogDateRange = sheet.getRange(1, 1);
  var newLogTextRange = sheet.getRange(1, 2);
  sheet.insertRowBefore(1);
  var now = new Date();
  newLogDateRange.setValue(now);
  newLogTextRange.setValue(log)
}


function compareArrays(a1,a2) {
  if(a1.length != a2.length) return false;
  for(let i=0; i<a1.length; i++){
    if(a1[i] != a2[i]) return false;
  }
  return true;
}

function removeArrayElements(array, indices){
  let newArray = [];
  
  for(let index of indices){
    array[index] = '-1';
  }
  
  for(let elem of array){
    if(elem != '-1'){
      newArray.push(elem);
    }
  }
  
  return newArray;
}

function compareArraysReturnDifference(a1, a2){
  let newArray = [];
  for(let elemA1 of a1){
    let found = false;
    for(let elemA2 of a2){
      if(compareArrays(a1,a2)){
        found = true;
        break;
      }
    }
    if(!found){
      newArray.push(elemA1);
    }
  }
  
  return newArray;
}