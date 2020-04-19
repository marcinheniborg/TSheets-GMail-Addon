class gSheet{
  constructor(sheetName){
    this.spreadsheet = SpreadsheetApp.getActive();
    this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    this.sheetData = this.sheet.getDataRange().getValues();
    
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
      timesheet_cost: 3
    }
  }
  
  getValue(ID_inDataColumn, columnIndex){ // i.e. elementID = companyID, 
   
    let indicesColumn = this.dataColumnIndices.indices_column;
    
    for(let i=0; i<this.sheetData.length; i++){
      let row = this.sheetData[i];
      if(row[indicesColumn] == ID_inDataColumn){
        return {row: i, column: columnIndex, value: row[columnIndex]}
      }        
    }
    return null;
  }
  
  setValue(row, column, value){
    this.sheetData[row][column] = value;
  }
  
  addAssignmentTimesheet(assignmentID, timesheet){
    //DEBUG
    timesheet = ['test2.1', 'test2', 'test3', 'test4', 'test5','','','','','']
    let timesheetsEndRow = this.getValue('assignmentID_'+assignmentID+'_timesheetsStart', this.dataColumnIndices.indices_column).row;
    
    this.sheetData.splice(timesheetsEndRow+1, 0, timesheet);
    
    this.sendFullDataArrayToSheet();
    
  }
  
  updateTotals(assignmentID, addHours, addCost){
    let totalHours = this.getValue('assignmentID_'+assignmentID+'_totals', this.dataColumnIndices.total_hours);
    let totalCost = this.getValue('assignmentID_'+assignmentID+'_totals', this.dataColumnIndices.total_cost);
    
    totalHours.value += addHours;
    totalCost.value += addCost;
    
    this.setValue(totalHours.row, totalHours.column, totalHours.value);
    this.setValue(totalCost.row, totalCost.column, totalCost.value);
    
    this.sendFullDataArrayToSheet();
  }
  
  sendFullDataArrayToSheet(){
    this.sheet.clear();
    this.sheet.getRange(1, 1, this.sheetData.length, this.sheetData[0].length).setValues(this.sheetData);
  }
  
  
}