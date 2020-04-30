function getProjectsTimeByDateRange(startDate, endDate){
  const firebaseForbiddenChars = /\$|#|\[|\]|\/|\./g; //regex for the forbidden chars, | stands for 'or' and \ is 
  let tTracking = new TimeTracking(ts.getTSService());
  tTracking.getUsers();
  tTracking.getTimeSheetsDateRange(startDate, endDate);
  createSheet(tTracking.customers)
  
  
  //tTracking.sortTimeSheets();
  //let dateRanges = tTracking.getDateRanges();
  //let jobCodes = tTracking.getJobCodes('2020-02-06');
  //let calendars = tTracking.getCalendars();
  //let skynetCalendarCode = '62979';
  //schedule has all the schedule entries grouped by /customer/service or customer/project
  let schedule = tTracking.getSchedule(startDate, endDate);
  
  let projectTimesheets = {};
  
  let dbCustomers = {};
  let dbProjects = {};
  let dbTimesheets = {};
  
  //get timesheets that are for the same customer and the same date as schedule and save them in tTracking.schedules.byCompany.projects[scheduleTitle].timesheets; also fill out the new object projectTimesheets
  for(let companyID in tTracking.schedules.byCompany){
    if (companyID == '0') continue;
    let companySchedules = tTracking.schedules.byCompany[companyID];
    
   
    //remove forbidden in Firebase characters 
    let customerName = companySchedules.customerName;
    
    customerName = customerName.replace(firebaseForbiddenChars,' ');
    
    dbCustomers[customerName] = {};
    dbCustomers[customerName]['id'] = companyID;
    dbCustomers[customerName]['name'] = customerName;
    dbCustomers[customerName]['hasTimesheets'] = false;
    
    let datesChecked = []; // to store dates of timesheets that were already added to the customer
    if(!companySchedules.hasOwnProperty('projects')) continue; // projects are recognized by having a quote number in the schedule name
    for(let assignmentName in companySchedules.projects){
      let assignment = companySchedules.projects[assignmentName];
      
      if(assignmentName=='Install 19512 & 19516 & 19528'){
        let a =1;
      }
      
       //remove forbidden in Firebase characters 
      assignmentName = assignmentName.replace(firebaseForbiddenChars,' ');
      
      if(!dbProjects.hasOwnProperty(assignmentName)){
        dbProjects[assignmentName] = {};
        dbProjects[assignmentName]['id'] = assignment.scheduleID;
        dbProjects[assignmentName]['name'] = assignmentName;
        dbProjects[assignmentName]['customerId'] = companyID;
        dbProjects[assignmentName]['customerName'] = customerName;
        dbProjects[assignmentName]['firstTimesheet'] = '';
        dbProjects[assignmentName]['quotes'] = assignment.quotes;
        dbProjects[assignmentName]['totalHours'] = 0;
        dbProjects[assignmentName]['totalCost'] = 0;
      } else
      {
        //if the assignment is already in the dbProjects that means that it is a duplicate name for a different customer name in this case it was AAA Holding and AAA - South Holland - they both had the same assignment name
        let randomDuplicateID = parseInt(Math.random() * 1000000);
        assignmentName += "__" + randomDuplicateID;
        dbProjects[assignmentName] = {};
        dbProjects[assignmentName]['id'] = assignment.scheduleID;
        dbProjects[assignmentName]['name'] = assignmentName;
        dbProjects[assignmentName]['customerId'] = companyID;
        dbProjects[assignmentName]['customerName'] = customerName;
        dbProjects[assignmentName]['firstTimesheet'] = '';
        dbProjects[assignmentName]['quotes'] = assignment.quotes;
        dbProjects[assignmentName]['totalHours'] = 0;
        dbProjects[assignmentName]['totalCost'] = 0;
      }
          
      
      let timeSheetsFound = false;
      let assignmentCost = 0;
      
      for (let scheduleDate in assignment.scheduleDates){      
        //let assignmentDate = employeeAssignment.start;
        datesChecked.push(scheduleDate); // used to get other timesheets that were on other dates for this customer
                
        let timeSheets = tTracking.getTimeSheetsByParams(companyID, scheduleDate)
        
        if(timeSheets){
          dbCustomers[customerName].hasTimesheets = true;
          
          timeSheetsFound = true;
          if(!assignment.hasOwnProperty('timesheets')){
          assignment.timesheets = [];
          }
          
          assignment.timesheets.push(...timeSheets);
               
          if(!projectTimesheets.hasOwnProperty(customerName)){
            projectTimesheets[customerName] = {};
            projectTimesheets[customerName]['companyID'] = companyID;
            projectTimesheets[customerName]['name'] = customerName;
          }          
          
         
          //configure data to save in the db
          if(!dbTimesheets.hasOwnProperty(customerName)){
            dbTimesheets[customerName] = [];
          }
          
          
          //debug
          if(customerName == 'LBP Manufacturing, Inc - 5490 Roosevelt'){
            let a =1;
          }
          
          for(let timesheet of timeSheets){
            timesheet['startDate'] = timesheet['startTime'].split(', ')[0]
            timesheet['startTimeOnly'] = timesheet['startTime'].split(', ')[1];
            timesheet['endDate'] = timesheet['endTime'].split(', ')[0]
            timesheet['endTimeOnly'] = timesheet['endTime'].split(', ')[1];
            timesheet['customerName'] = customerName;
            timesheet['customerId'] = companyID;
            timesheet['projectName'] = assignmentName;
            timesheet['projectId'] = assignment.scheduleID;
          }
          dbTimesheets[customerName].push(...timeSheets);
          

          if(!projectTimesheets[customerName].hasOwnProperty(assignmentName)){
            projectTimesheets[customerName][assignmentName] = {};
            projectTimesheets[customerName][assignmentName].name = assignmentName;
            projectTimesheets[customerName][assignmentName].assignmentID = assignment.scheduleID;
            projectTimesheets[customerName][assignmentName].quotes = assignment.quotes;
            projectTimesheets[customerName][assignmentName].timeSheets = [];
            projectTimesheets[customerName][assignmentName].totalHours = 0;
            projectTimesheets[customerName][assignmentName].totalCost = 0;
            projectTimesheets[customerName][assignmentName].customerName = customerName;
            
          }
          projectTimesheets[customerName][assignmentName].timeSheets.push(...timeSheets);
          
          }
      }
      
      
      
      
      if(timeSheetsFound){
        for(let timesheet of projectTimesheets[customerName][assignmentName].timeSheets){
            projectTimesheets[customerName][assignmentName].totalHours += timesheet.duration;
            projectTimesheets[customerName][assignmentName].totalCost += parseFloat(timesheet.cost);    
          
            dbProjects[assignmentName]['totalHours'] += timesheet.duration;
            dbProjects[assignmentName]['totalCost'] += parseFloat(timesheet.cost);
        }
        
        //get reamining timesheets that were not part of the schedule
        if(!projectTimesheets[customerName].hasOwnProperty('otherTimeSheets')){
          projectTimesheets[customerName].otherTimeSheets = {};
        }
        
        if(!projectTimesheets[customerName].otherTimeSheets.hasOwnProperty('timesheets')){
          projectTimesheets[customerName].otherTimeSheets.timesheets = [];
          projectTimesheets[customerName].otherTimeSheets.totalHours = 0;
          projectTimesheets[customerName].otherTimeSheets.totalCost = 0;
          projectTimesheets[customerName].otherTimeSheets.customerName = customerName;
          
        }
        
        timeSheetsFound = false;
      }
    }
    
    if(projectTimesheets.hasOwnProperty(customerName)){ // this means that in the previous loop the projectTimesheet was created for this customer and we need to check other timeSheets now (excluding the ones that were already added
      let remainingTimesheets = tTracking.getTimesheetsExceptDates(companyID, datesChecked);
      if(remainingTimesheets && Array.isArray(remainingTimesheets)){
        projectTimesheets[customerName].otherTimeSheets.timesheets.push(...remainingTimesheets);
      }
      
      for(let otherTimesheet of projectTimesheets[customerName].otherTimeSheets.timesheets){
        projectTimesheets[customerName].otherTimeSheets.totalHours += otherTimesheet.duration;
        projectTimesheets[customerName].otherTimeSheets.totalCost += parseFloat(otherTimesheet.cost);
      }
    }
    
  }
  return {sheetData:projectTimesheets, dbCustomers: dbCustomers, dbProjects: dbProjects, dbTimesheets: dbTimesheets};  
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
      
      //following if statements are making sure that timesheets that have been already used are not used again by creating an object, if this object already exists that means that the timesheets were already used
      // this situation may take place if employee had 2 or more schedules (assignments) on the same date for the same customer
      // this prevents double (or more times) counting of time on timesheets
      if(!this.hasOwnProperty('timesheetsUsed')){
        this.timesheetsUsed = {};
      }
      
      if(!this.timesheetsUsed.hasOwnProperty(customerID)){
        this.timesheetsUsed[customerID] = {};
      }
      
      if(!this.timesheetsUsed[customerID].hasOwnProperty(date)){
        this.timesheetsUsed[customerID][date] = true;
      } else {
        return false;
      }      
      
      this.customers[customerID][date]
      return this.customers[customerID][date];
    } else {
      return false;
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
      return false;
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
  
  getSchedule(sinceDate, endDate, page){
    //this.getJobCodes(sinceDate)
    
    
    let rawScheduleData = this.ts.getScheduleData(sinceDate, page, endDate);
    
    // continue on rawScheduleData.more implementation
    let scheduleData = rawScheduleData.results.schedule_events;
    let supplementalData = rawScheduleData.supplemental_data;
        
    for(let k in scheduleData){
      let scheduleEvent = scheduleData[k];  
         
      if(scheduleEvent.title == 'Install 19848')
      {
        let a=1;
      }
      
      if (!scheduleEvent.active) continue;
      
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
      this.getSchedule(sinceDate, endDate, page) // recursively get another page if there is more data
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

