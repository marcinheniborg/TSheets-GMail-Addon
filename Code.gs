function getDataFromSheet(){
  let sheet = new gSheet('Projects');
  let value = sheet.getValue('assignmentID_43290235_totals', sheet.dataColumnIndices.total_hours);
  
  sheet.addAssignmentTimesheet('43290143','');
  
  sheet.updateTotals('42286294', 100, 100)
  let a = 1;
}

function getProjectsTimeByDateRange(){
  let tTracking = new TimeTracking(ts.getTSService());
  tTracking.getUsers();
  tTracking.getTimeSheetsDateRange('2020-03-15', '2020-04-18');
  createSheet(tTracking.customers)
  //tTracking.sortTimeSheets();
  //let dateRanges = tTracking.getDateRanges();
  //let jobCodes = tTracking.getJobCodes('2020-02-06');
  //let calendars = tTracking.getCalendars();
  //let skynetCalendarCode = '62979';
  //schedule has all the schedule entries grouped by /customer/service or customer/project
  let schedule = tTracking.getSchedule('2020-03-15');
  
  let projectTimesheets = {};
  
  //get timesheets that are for the same customer and the same date as schedule and save them in tTracking.schedules.byCompany.projects[scheduleTitle].timesheets; also fill out the new object projectTimesheets
  for(let companyID in tTracking.schedules.byCompany){
    if (companyID == '0') continue;
    let companySchedules = tTracking.schedules.byCompany[companyID];
    
    //DEBUG
    if(companySchedules.customerName.includes('AAA')){
      let a =1;
    }
    //END DEBUG
    let datesChecked = []; // to store dates of timesheets that were already added to the customer
    if(!companySchedules.hasOwnProperty('projects')) continue; // projects are recognized by having a quote number in the schedule name
    for(let assignmentName in companySchedules.projects){
      let assignment = companySchedules.projects[assignmentName];
      
      let timeSheetsFound = false;
      let assignmentCost = 0;
      
      for (let scheduleDate in assignment.scheduleDates){      
        //let assignmentDate = employeeAssignment.start;
        datesChecked.push(scheduleDate); // used to get other timesheets that were on other dates for this customer
        //DEBUG
        if(companyID == '6095441'){
          let a =1;
        }
        //DEBUGEND
        
        let timeSheets = tTracking.getTimeSheetsByParams(companyID, scheduleDate)
        if(timeSheets){
          timeSheetsFound = true;
          if(!assignment.hasOwnProperty('timesheets')){
          assignment.timesheets = [];
          }
          
          assignment.timesheets.push(...timeSheets);
          
          if(!projectTimesheets.hasOwnProperty(companySchedules.customerName)){
            projectTimesheets[companySchedules.customerName] = {};
            projectTimesheets[companySchedules.customerName]['companyID'] = companyID;
          }          
          
          if(!projectTimesheets[companySchedules.customerName].hasOwnProperty(assignmentName)){
            projectTimesheets[companySchedules.customerName][assignmentName] = {};
            projectTimesheets[companySchedules.customerName][assignmentName].assignmentID = assignment.scheduleID
            projectTimesheets[companySchedules.customerName][assignmentName].quotes = assignment.quotes;
            projectTimesheets[companySchedules.customerName][assignmentName].timeSheets = [];
            projectTimesheets[companySchedules.customerName][assignmentName].totalHours = 0;
            projectTimesheets[companySchedules.customerName][assignmentName].totalCost = 0;
          }
          projectTimesheets[companySchedules.customerName][assignmentName].timeSheets.push(...timeSheets);
          
          }
      }
      
      
      
      
      if(timeSheetsFound){
        for(let timesheet of projectTimesheets[companySchedules.customerName][assignmentName].timeSheets){
            projectTimesheets[companySchedules.customerName][assignmentName].totalHours += timesheet.duration;
            projectTimesheets[companySchedules.customerName][assignmentName].totalCost += parseFloat(timesheet.cost);          
        }
        
        //get reamining timesheets that were not part of the schedule
        if(!projectTimesheets[companySchedules.customerName].hasOwnProperty('otherTimeSheets')){
          projectTimesheets[companySchedules.customerName].otherTimeSheets = {};
        }
        
        if(!projectTimesheets[companySchedules.customerName].otherTimeSheets.hasOwnProperty('timesheets')){
          projectTimesheets[companySchedules.customerName].otherTimeSheets.timesheets = [];
          projectTimesheets[companySchedules.customerName].otherTimeSheets.totalHours = 0;
          projectTimesheets[companySchedules.customerName].otherTimeSheets.totalCost = 0;
        }
        
        timeSheetsFound = false;
      }
    }
    
    if(projectTimesheets.hasOwnProperty(companySchedules.customerName)){ // this means that in the previous loop the projectTimesheet was created for this customer and we need to check other timeSheets now (excluding the ones that were already added
      let remainingTimesheets = tTracking.getTimesheetsExceptDates(companyID, datesChecked);
      if(remainingTimesheets && Array.isArray(remainingTimesheets)){
        projectTimesheets[companySchedules.customerName].otherTimeSheets.timesheets.push(...remainingTimesheets);
      }
      
      for(let otherTimesheet of projectTimesheets[companySchedules.customerName].otherTimeSheets.timesheets){
        projectTimesheets[companySchedules.customerName].otherTimeSheets.totalHours += otherTimesheet.duration;
        projectTimesheets[companySchedules.customerName].otherTimeSheets.totalCost += parseFloat(otherTimesheet.cost);
      }
    }
    
  }
  
  
  let sheet = new gSheet('Projects');
  sheet.createProjectSheet(projectTimesheets)
  
  let a = 1;
}



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

class TimeTracking{
  constructor(tSheetsService){
    this.ts = tSheetsService;
    this.users = {};
    this.jobCodes = {};
    this.customers = {};
    this.timeSheets = [];
    this.schedules = {};
    this.schedules.byUser = {};
    this.schedules.byCompany = {};
    
  }
  
  getUsers(){
    let tsUserData = this.ts.getUsers().results.users;
    let users = {};
    for(let k in tsUserData){
      users[k] = {};
      users[k].fName = tsUserData[k].first_name;
      users[k].lName = tsUserData[k].last_name;
      users[k].email = tsUserData[k].email;
      users[k].phone = tsUserData[k].mobile_number;
      users[k].active = tsUserData[k].active;
      users[k].payRate = tsUserData[k].pay_rate;
      users[k].payInterval = tsUserData[k].pay_interval;
    }
    this.users = users;
  }
  
  getTimeSheetsByParams(customerID, date){
    if(this.customers.hasOwnProperty(customerID) && this.customers[customerID].hasOwnProperty(date)){
      return this.customers[customerID][date];
    } else {
      return null;
    }
  }
  
  getTimesheetsExceptDates(customerID, exceptDates){
    let timesheets = [];
    if(this.customers.hasOwnProperty(customerID)){
       
       for(let k in this.customers[customerID]){         
         if (k == 'customer' || k == 'timeSheets' || k == 'duration') continue;  //do not proceed on these properties, the other properties are dates of timeSheets
         let data = this.customers[customerID][k];
         if (exceptDates.includes(k)) continue;
         timesheets.push(...data);
       }
    
       return timesheets;
    } else {
      return null;
    }
  }
  
  getTimeSheetsDateRange(startDate, endDate){
    let timesheets = {}; // create timesheets object
  
    for(let k in this.users){
      let userTimesheets = this.ts.getTimeSheets(startDate, endDate, k); // (startDate, endDate, userID) // get all the timesheets for user in this loop
      //timesheets[k] = userTimesheets; // save this timesheet in object holding timesheets grouped by users
      this.users[k]['timesheets'] = {}; // create 
      
      let payRate = this.users[k].payInterval == 'hour' ? this.users[k].payRate : this.users[k].payRate/2080; // 2080 average hours in a year based on 52 weeks x 40h
     
      //DEBUG
      let userName = this.users[k].hasOwnProperty('fName') ? this.users[k].fName : 'no name';
      if (userName != 'no name'){
        let a =1;
      }
      //END DEBUG
      
      for(let l in userTimesheets){
        let timesheet = userTimesheets[l];
        for(let elem of timesheet){ // timesheet holds a list of time entries for user in this loop
          let date = elem.startTime.split(',')[0]
          let x = new moment(elem.startTime)
          let y = new moment(elem.endTime)
          let duration = parseFloat(moment.duration(y.diff(x)).as('hours').toFixed(2));
          
          let cost = parseFloat(parseFloat(payRate!='N/A' ? duration * payRate : 'N/A').toFixed(2));
          // returns duration object with the duration between x and y
          this.users[k]['timesheets'][date] = [];
          let timeEntry = {};
          
          timeEntry.startTime = elem.startTime;
          timeEntry.endTime = elem.endTime;
          timeEntry.duration = duration;
          timeEntry.cost = cost;
          timeEntry.customer = elem.customer;
          timeEntry.jobCode = elem.jobCode;
          //timeEntry.onTheClock = elem. onTheClock;
          
          this.users[k]['timesheets'][date].push(timeEntry);
          
          
          if(!this.customers.hasOwnProperty(elem.jobCode)){
            this.customers[elem.jobCode] = {};
            this.customers[elem.jobCode].customer = elem.customer;
            this.customers[elem.jobCode].timeSheets = [];
            this.customers[elem.jobCode].duration = 0;            
          }
          
          
          // insert timeSheets into the customer grouped by date of the timesheet to later assign it to schedule
          if(!this.customers[elem.jobCode].hasOwnProperty(date)){
            this.customers[elem.jobCode][date] = [];
          }
          
          
          timeEntry.user = this.users[k].lName + ', ' + this.users[k].fName;
         
          this.customers[elem.jobCode].timeSheets.push(timeEntry);
          this.customers[elem.jobCode].duration += timeEntry.duration;     
          
          this.customers[elem.jobCode][date].push(timeEntry);
          
          this.timeSheets.push(timeEntry);
        }
      }
    }
  }
  
  sortTimeSheets(){
    this.soretedByDate = {};
    for(let customer in this.customers){
      let customerTimeSheets = this.customers[customer].timeSheets;
      if(customerTimeSheets){
        customerTimeSheets.sort(this.sortingByDate)
      }      
    }
    this.timeSheets.sort(this.sortingByDate);
  }
  
  getJobCodes(sinceDate){
    this.jobCodes = this.ts.getJobCodes(sinceDate);
  }
  
  getCalendars(){
    return this.ts.getCalendars();
  }
  
  getSchedule(sinceDate, page){
    //this.getJobCodes(sinceDate)
    
    
    let rawScheduleData = this.ts.getScheduleData(sinceDate, page);
    
    // continue on rawScheduleData.more implementation
    let scheduleData = rawScheduleData.results.schedule_events;
    let supplementalData = rawScheduleData.supplemental_data;
        
    for(let k in scheduleData){
      let scheduleEvent = scheduleData[k];  
            
      let users = scheduleEvent.assigned_user_ids.split(',');
      
      let scheduleEventData = {};
     // for(let user of users){
        
        scheduleEventData = {};
           
        scheduleEventData.fName = supplementalData.users[scheduleEvent['user_id']].first_name;
        scheduleEventData.lName = supplementalData.users[scheduleEvent['user_id']].last_name;
        scheduleEventData.jobCode = scheduleEvent.jobcode_id;
        if(scheduleEvent.jobcode_id){
          scheduleEventData.customerName = supplementalData.jobcodes[scheduleEvent.jobcode_id].name;
        }        
        scheduleEventData.title = scheduleEvent.title;
        if(scheduleEvent.hasOwnProperty('notes')){
          scheduleEventData.notes = scheduleEvent.notes;
        }
        scheduleEventData.start = this.formatDate(scheduleEvent.start.split('T')[0]);
        scheduleEventData.end = this.formatDate(scheduleEvent.end.split('T')[0]);
        scheduleEventData.users = scheduleEvent.assigned_user_ids;
        
        
//        if(!this.schedules.byUser.hasOwnProperty(scheduleEvent.user_id)){
//           this.schedules.byUser[scheduleEvent.user_id] = [];           
//        }
//        
//        
//        this.schedules.byUser[scheduleEvent.user_id].push(scheduleEventData);
     // }
      
      //assign event's main person back
     // scheduleEventData.fName = supplementalData.users[scheduleEvent['user_id']].first_name;
      //scheduleEventData.lName = supplementalData.users[scheduleEvent['user_id']].last_name;
      
      //make sure the customer is in the object
      if(!this.schedules.byCompany.hasOwnProperty(scheduleEventData.jobCode)){
        this.schedules.byCompany[scheduleEventData.jobCode] = {};
        this.schedules.byCompany[scheduleEventData.jobCode].customerName = scheduleEventData.customerName;
      }
      
      //check if the service is in the title if so this is a service if not it may be a project
//      let typeOfJob = 'projects';
//      if(scheduleEventData.title.includes('service') || scheduleEventData.title.includes('Service') || scheduleEventData.title.includes('SERVICE')){
//        typeOfJob = 'projects';        
//      }
      
      let typeOfJob = 'services';
      let matches = scheduleEventData.title.match(/\b\d{5}\b/g) // check title for 5 digits together aka quote number; may be more than one; matches will become an array with matches
      let quoteNumberCount = matches ? matches.length:0;
      if(quoteNumberCount > 0){
        typeOfJob = 'projects';        
      }
      
      if (!this.schedules.byCompany[scheduleEventData.jobCode].hasOwnProperty(typeOfJob)){
          this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob] = {} 
      }
      
      if (!this.schedules.byCompany[scheduleEventData.jobCode].hasOwnProperty('all')){
          this.schedules.byCompany[scheduleEventData.jobCode]['all'] = [] 
      }
      
      this.schedules.byCompany[scheduleEventData.jobCode]['all'].push(scheduleEventData);
      
      //make sure the job title is in the object
      if(!this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob].hasOwnProperty(scheduleEventData.title)){
        this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title] = {};
        this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title].quotes = matches;
        this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title].scheduleID = k; // save schedule event ID
      }
      
      if(!this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title].hasOwnProperty('scheduleDates')){
        this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title].scheduleDates = {};
      }
      
      if(!this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title].scheduleDates.hasOwnProperty(scheduleEventData.start)){
        this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title].scheduleDates[scheduleEventData.start] = [];
      }
      
      this.schedules.byCompany[scheduleEventData.jobCode][typeOfJob][scheduleEventData.title].scheduleDates[scheduleEventData.start].push(scheduleEventData);
    }
    
    if(rawScheduleData.more){
      if(!page) page = 1;
      page++;
      this.getSchedule(sinceDate, page) // recursively get another page if there is more data
    }
  }
  
  getDateRanges(){
//    let today = new moment();
//    let dayOfWeek = today.day();
//    
//    let startOfTheWeekDate = today.subtract(dayOfWeek, 'days');
//    today = new moment();
    this.thisWeekToDate = {start: moment().startOf('isoweek').format('MM-DD-YYYY'), end: moment().format('MM-DD-YYYY')};
    this.lastWeek = {start: moment().subtract(1, 'weeks').startOf('isoweek').format('MM-DD-YYYY'), end: moment().subtract(1, 'weeks').endOf('isoweek').format('MM-DD-YYYY')};
    this.twoWeeksAgo = {start: moment().subtract(2, 'weeks').startOf('isoweek').format('MM-DD-YYYY'), end: moment().subtract(2, 'weeks').endOf('isoweek').format('MM-DD-YYYY')};
                                                                 
    //return {startDate: moment().startOf('isoweek').format, endDate: today}; 
  }
  
  sortingByDate(a, b){
    let date1 = new moment(a.startTime);
    let date2 = new moment(b.startTime);
          
    if((date1).isAfter(date2)){
      return 1;
    } else if ((date2).isAfter(date1)){
      return -1;
    }
    return 0;
  }
  
  formatDate(dateIn){
    let dateParts = dateIn.split('-');
    
    let year = dateParts[0];
    let month = dateParts[1].replace(/^0+/, '');  // regex to remove leading 0
    let day = dateParts[2].replace(/^0+/, '');
    
    return month + '/' + day + '/' + year;
  }
}

