function createSheet(customers){
  let sheet = SpreadsheetApp.getActive().getSheetByName('All timesheets');
  let dataArray = [];
  
  let index = 0;
  dataArray[index] = ['Customer', 'Date', 'Timesheets'];
  for(let customerID in customers){    
    index ++;
    let customer = customers[customerID];
    
    dataArray[index] = [];
    dataArray[index].push(customer.customer);
    dataArray[index].push('duration: ' + customer.duration);
    dataArray[index].push(' ');
//    let customerLineIndex = index;
//    let totalDuration
    for(let timeEntry of customer.timeSheets){
      index++;
      dataArray[index] = [];
      dataArray[index].push(' ');
      dataArray[index].push(timeEntry.startTime);
      dataArray[index].push(timeEntry.user + ', duration: ' + timeEntry.duration);      
    }
  }
  sheet.clear();
  sheet.getRange(1, 1, index+1, 3).setValues(dataArray)
}


class gSheet{
  constructor(sheetName){
    this.spreadsheet = SpreadsheetApp.getActive();
    this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    this.sheetData = this.sheet.getDataRange().getValues();
    this.columnsCount = 10;
    
    this.dataColumnIndices = {
      indices_column: 9,
      company_name: 0,
      assignment_name: 0,
      timesheet_start: 0,
      timesheet_end: 1,
      timesheet_tech: 2,
      total_hours: 3,
      total_cost: 4,
      timesheet_hours: 3,
      timesheet_cost: 4
    }
  }
  
  buildDataRow(dataArray){ // this is to create every row of an equal length which is achieved by filling up the row with empty string up to required length   
    let dataRow = [...dataArray];    
    
    if(dataRow.length < this.columnsCount){
      dataRow.push(...Array(this.columnsCount - dataRow.length).fill(""))
    }
    return dataRow;
  }
  
  isValuePresent(ID_inDataColumn, startRow){ // startRow is for optimization so the search does not start always from the beggining
    if(!startRow) startRow = 0;
    let value = this.getValue(ID_inDataColumn, this.dataColumnIndices.indices_column, startRow);
    if(value){
      return {present:true, value: value.value, row:value.row, column:value.column};
    }    
    return {present:false, value: '', row:'', column:''};
  }
  
  getValue(ID_inDataColumn, columnIndex, startRow){ // i.e. ID_inDataColumn = companyID_6095441_start, columnIndex = this.dataColumnIndices.total_hours
   
    if(!startRow) startRow=0;
      
    let indicesColumn = this.dataColumnIndices.indices_column;
    
    for(let i=startRow; i<this.sheetData.length; i++){
      let row = this.sheetData[i];
      if(row[indicesColumn] == ID_inDataColumn){
        return {row: i, column: columnIndex, value: row[columnIndex]}
      }        
    }
    return false;
  }
  
  setValue(row, column, value){
    this.sheetData[row][column] = value;
  }
  
  getAssignmentTimesheets(assignmentID, startRow){
    let ID_inDataColumn = 'assignmentID_'+assignmentID+'_timesheetsStart'
    let timesheetsStart = this.isValuePresent(ID_inDataColumn, startRow);
    
    ID_inDataColumn = 'assignmentID_'+assignmentID+'_timesheetsEnd'
    let timesheetsEnd = this.isValuePresent(ID_inDataColumn, startRow);
    
    let timesheets = this.sheetData.slice(timesheetsStart.row+1, timesheetsEnd.row+1);
    return timesheets;
  }
  
  getOtherTimesheets(companyID, startRow){
    let ID_inDataColumn = 'companyID_'+companyID+'_otherTimesheetsStart'
    let timesheetsStart = this.isValuePresent(ID_inDataColumn, startRow);
    
    ID_inDataColumn = 'companyID_'+companyID+'_otherTimesheetsEnd'
    let timesheetsEnd = this.isValuePresent(ID_inDataColumn, startRow);
    
    let timesheets = this.sheetData.slice(timesheetsStart.row+1, timesheetsEnd.row+1);
    return timesheets;
  }
  
  addAssignmentTimesheet(assignmentID, timesheet){
    //DEBUG
    //timesheet = ['test2.1', 'test2', 'test3', 'test4', 'test5','','','','','']
    let timesheetsStartRow = this.getValue('assignmentID_'+assignmentID+'_timesheetsStart', this.dataColumnIndices.indices_column).row;
    let timesheetArray = this.buildDataRow([timesheet.startTime, timesheet.endTime, timesheet.user, timesheet.duration, timesheet.cost])
    this.sheetData.splice(timesheetsStartRow+1, 0, timesheetArray);
    
    //this.sendFullDataArrayToSheet();
    
  }
  
  addOtherTimesheet(companyID, timesheet){
    //DEBUG
    //timesheet = ['test2.1', 'test2', 'test3', 'test4', 'test5','','','','','']
    let timesheetsStartRow = this.getValue('companyID_'+companyID+'_otherTimesheetsStart', this.dataColumnIndices.indices_column).row;
    let timesheetArray = this.buildDataRow([timesheet.startTime, timesheet.endTime, timesheet.user, timesheet.duration, timesheet.cost]);
    this.sheetData.splice(timesheetsStartRow+1, 0, timesheetArray);
    
    //this.sendFullDataArrayToSheet();
    
  }
  
  updateTotals(assignmentID, addHours, addCost){
    let totalHours = this.getValue('assignmentID_'+assignmentID+'_totals', this.dataColumnIndices.total_hours);
    let totalCost = this.getValue('assignmentID_'+assignmentID+'_totals', this.dataColumnIndices.total_cost);
    
    totalHours.value += addHours;
    totalCost.value += addCost;
    
    this.setValue(totalHours.row, totalHours.column, totalHours.value);
    this.setValue(totalCost.row, totalCost.column, totalCost.value);
    
    //this.sendFullDataArrayToSheet();
  }
  
  updateOtherTimesheetsTotals(companyID, addHours, addCost){
    let totalHours = this.getValue('companyID_'+companyID+'_otherTimesheetsTotals', this.dataColumnIndices.total_hours);
    let totalCost = this.getValue('companyID_'+companyID+'_otherTimesheetsTotals', this.dataColumnIndices.total_cost);
    
    totalHours.value += addHours;
    totalCost.value += addCost;
    
    this.setValue(totalHours.row, totalHours.column, totalHours.value);
    this.setValue(totalCost.row, totalCost.column, totalCost.value);
    
    //this.sendFullDataArrayToSheet();
  }
  
  writeNewCustomer(customerData){
    let customerArray = this.buildCustomerArray(customerData);
    this.sheetData.unshift(...customerArray)
  }
  
  writeNewAssignment(customerID, assignment, assignmentName, startRow){
    let assignmentArray = this.buildAssignmentArray(assignment, assignmentName);
    
    let ID_inDataColumn = 'companyID_'+customerID+'_start';    
    let customerLocation = this.getValue(ID_inDataColumn, this.dataColumnIndices.indices_column, startRow);
    this.sheetData.splice(customerLocation.row+1,0,...assignmentArray)
  }
  
  writeOtherTimesheets(companyID, otherTimeSheets, startRow){
    let ID_inDataColumn = 'companyID_'+companyID+'_otherTimesheetsTotals';  // get totals to see if there are any timesheets
    let totalHours = this.getValue(ID_inDataColumn, this.dataColumnIndices.total_hours, startRow);
    if(totalHours.value>0){ // this means that there are existing other timesheets and start and end for them
      let existingTimesheetsInSheet = this.getOtherTimesheets(companyID, startRow);
      let timesheetsToAddToSheet = compareArraysReturnDifference(otherTimeSheets.timesheets, existingTimesheetsInSheet);
      
      ID_inDataColumn = 'companyID_'+companyID+'_otherTimesheetsStart';
      let timesheetStart = this.getValue(ID_inDataColumn, this.dataColumnIndices.indices_column, startRow);
      
      for(let newTimesheet of timesheetsToAddToSheet){
        this.addOtherTimesheet(companyID, newTimesheet);
      }
    }
  }
  
  buildAssignmentArray(assignment, assignmentName){
    let dataArray = [];
    let index = 0;
    
    dataArray[index] = this.buildDataRow([assignmentName,'', '', '', '','','','','','assignmentID_'+assignment.name]);
      
    let quotes = '';
    if(Array.isArray(assignment.quotes)){
      for(let quote of assignment.quotes){
        quotes += quote + '  ';
      }
    }
    
    dataArray[++index] = this.buildDataRow(['quotes' , '', '', 'total hours', 'total cost'])
    dataArray[++index] = this.buildDataRow([quotes , '','', assignment.totalHours, assignment.totalCost, '','','','','assignmentID_'+assignment.name+'_totals'])
    
    dataArray[++index] = this.buildDataRow(['TIMESHEETS','','','','','','','','','assignmentID_'+assignment.name+'_timesheetsStart'])
    for(let timeSheet of assignment.timeSheets){
      dataArray[++index] = this.buildDataRow([timeSheet.startTime, timeSheet.endTime, timeSheet.user, timeSheet.duration, timeSheet.cost,'','','','',''])
    }
    dataArray[index].pop();
    dataArray[index].push('assignmentID_'+assignment.name+'_timesheetsEnd')
    dataArray[++index] = this.buildDataRow(['']);
    
    return dataArray;
  }
  
  buildCustomerArray(customerData){
    let dataArray = [];
    
    let index = 0;
    dataArray[index] = this.buildDataRow([' ']);
    
    dataArray[++index] = this.buildDataRow([customerData.name,'companyID = ' + customerData.companyID,'','','','','','','','companyID_'+customerData.companyID+'_start']);
    for(let scheduleTitle in customerData){
      if(scheduleTitle == 'companyID' || scheduleTitle == 'otherTimeSheets' || scheduleTitle == 'name') continue; // this object has a field companyID and the rest is schedule data
      let scheduleData = customerData[scheduleTitle];
      
      dataArray[++index] = this.buildDataRow([scheduleTitle,'', '', '', '','','','','','assignmentID_'+scheduleData.name]);
      
      let quotes = '';
      if(Array.isArray(scheduleData.quotes)){
        for(let quote of scheduleData.quotes){
          quotes += quote + '  ';
        }
      }
      
      dataArray[++index] = this.buildDataRow(['quotes' , '', '', 'total hours', 'total cost'])
      dataArray[++index] = this.buildDataRow([quotes , '','', scheduleData.totalHours, scheduleData.totalCost, '','','','','assignmentID_'+scheduleData.name+'_totals'])
      
      dataArray[++index] = this.buildDataRow(['TIMESHEETS','','','','','','','','','assignmentID_'+scheduleData.name+'_timesheetsStart']);
      for(let timeSheet of scheduleData.timeSheets){
        dataArray[++index] = this.buildDataRow([timeSheet.startTime, timeSheet.endTime, timeSheet.user, timeSheet.duration, timeSheet.cost])
      }
      dataArray[index].pop();
      dataArray[index].push('assignmentID_'+scheduleData.name+'_timesheetsEnd')
      dataArray[++index] = this.buildDataRow(['']);
      
    }
    
    if(customerData.otherTimeSheets && Array.isArray(customerData.otherTimeSheets.timesheets)){
      dataArray[++index] = this.buildDataRow(['OTHER TIMESHEETS FOR THIS CUSTOMER','','','','','','','','','companyID_'+customerData.companyID+'_otherTimesheets']);
      dataArray[++index] = this.buildDataRow(['','','','total hours','total cost']);
      dataArray[++index] = this.buildDataRow(['','','', customerData.otherTimeSheets.totalHours,customerData.otherTimeSheets.totalCost,'','','','','companyID_'+customerData.companyID+'_otherTimesheetsTotals']);
      dataArray[++index] = this.buildDataRow(['TMESHEETS','','','','','','','','','companyID_'+customerData.companyID+'_otherTimesheetsStart']);
      
      for(let otherTimesheet of customerData.otherTimeSheets.timesheets){        
        dataArray[++index] = this.buildDataRow([otherTimesheet.startTime, otherTimesheet.endTime, otherTimesheet.user, otherTimesheet.duration, otherTimesheet.cost])          
      }
      dataArray[index].pop();
      dataArray[index].push('companyID_'+customerData.companyID+'_otherTimesheetsEnd');
      dataArray[++index] = this.buildDataRow(['','','','','','','','','','companyID_'+customerData.companyID+'_end']);
      dataArray[++index] = this.buildDataRow(['']);
      
    } else {
      dataArray[++index] = this.buildDataRow(['']);
    }
    return dataArray;
  }
  
  createProjectSheet(data){
    //let sheet = SpreadsheetApp.getActive().getSheetByName('Projects');
    let dataArray = [];
    
    for(let customer in data){      
      let customerData = data[customer];    
      let customerDataArray = this.buildCustomerArray(customerData);
      dataArray.push(...customerDataArray)      
    }
    
    this.sheetData = dataArray;
    
//    let dataLength = dataArray.length;
//    this.sheet.clear();
//    this.sheet.getRange(1, 1, dataLength, 10).setValues(dataArray)
  }
  
  updateProjectSheet(data){
    
    for(let customer in data){    
      let customerData = data[customer];   
      
      let ID_inDataColumn = 'companyID_'+customerData.companyID+'_start';
      let isCustomerPresent = this.isValuePresent(ID_inDataColumn, 0)
      if (isCustomerPresent.present){
        for(let assignmentName in customerData){
          if(assignmentName == 'companyID' || assignmentName == 'name' || assignmentName == 'otherTimeSheets') continue;
          
          let assignment = customerData[assignmentName];
          ID_inDataColumn = 'assignmentID_' + assignment.name;
          let isAssignmentPresent = this.isValuePresent(ID_inDataColumn, isCustomerPresent.row); // start with a row that customer was found on
          let newTimesheets = assignment.timeSheets;
          if(isAssignmentPresent.present){
            let existingTimesheetsInSheet = this.getAssignmentTimesheets(assignment.name, isAssignmentPresent.row)
            if(existingTimesheetsInSheet.length>0) {
              
              let index = 0;
              let elementIndicesToRemove = [];
              for(let newTimesheet of newTimesheets){   
                let newTimesheetArray = this.buildDataRow([newTimesheet.startTime, newTimesheet.endTime, newTimesheet.user, newTimesheet.duration, newTimesheet.cost]); // convert timesheet object to array for comparison with the existing timesheet which is an array also
                for(let timesheet of existingTimesheetsInSheet){
                  let isTimesheetAlreadyInSheet = compareArrays(newTimesheetArray,timesheet) 
                  if(isTimesheetAlreadyInSheet){
                    elementIndicesToRemove.push(index);
                    break;
                  }
                }
                index++;
              }
              
              if(elementIndicesToRemove.length>0){
                newTimesheets = removeArrayElements(newTimesheets, elementIndicesToRemove)
              }
            }
            
            for(let timesheet of newTimesheets){
              this.addAssignmentTimesheet(assignment.name, timesheet)
              this.updateTotals(assignment.name, timesheet.duration, timesheet.cost)
              
            }
            
          } else { // if assignment is not present            
            this.writeNewAssignment(customerData.companyID, assignment, assignmentName, isCustomerPresent.row)
          }          
        }
        
        if(customerData.hasOwnProperty('otherTimeSheets') && customerData.otherTimeSheets.timesheets.length>0){
          let otherTimeSheets = customerData.otherTimeSheets;
          this.writeOtherTimesheets(customerData.companyID, otherTimeSheets, isCustomerPresent.row)
        }
             
      } else { //if customer is not present
        this.writeNewCustomer(customerData);
      }
    }
  }
  
  sendFullDataArrayToSheet(data){
    this.sheet.clear();
    this.sheet.getRange(1, 1, this.sheetData.length, this.sheetData[0].length).setValues(this.sheetData);
  }
}