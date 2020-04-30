function main(){
  
  let db = new firebase();
//  let db = new dbOperations();
//  let customersWithTimesheets = db.getCustomerProjects('14003643');
//  let a=1;
  
  //firebaseDB.setData({test:'test1'});
  
//  let customerData = db.getData('customers/AAA Holding', '')
//  let projectData = db.getData('projects', {orderBy:"customerId", equalTo: customerData.id}); 
//  
//  let projectTimeSheets = {};
//  for(let k in projectData){
//    projectTimeSheets[k] = db.getData('timesheets/'+projectData[k].customerName, {orderBy:"projectId", equalTo: projectData[k].id});
//  }
  
  
  let projectsData = getProjectsTimeByDateRange('2020-01-01', '2020-04-24');
  let sheet = new gSheet('Projects');
  
  db.setData('', {'customers':projectsData.dbCustomers, 'projects': projectsData.dbProjects, 'timesheets': projectsData.dbTimesheets});
  //sheet.createProjectSheet(projectsData)
  sheet.updateProjectSheet(projectsData.sheetData)
  sheet.sendFullDataArrayToSheet();
}


function getDataFromSheet(){
  let sheet = new gSheet('Projects');
  
  let timesheets = sheet.getAssignmentTimesheets('43290143', 1)
  //let value = sheet.getValue('assignmentID_43290235_totals', sheet.dataColumnIndices.total_hours);
  
 // sheet.addAssignmentTimesheet('43290143','');
  
 // sheet.updateTotals('42286294', 100, 100)
  let a = 1;
}





