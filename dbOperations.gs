class dbOperations{
  constructor(){
    this.db = new firebase();    
    this.customersWithTimesheets = {};
    this.customerProjects = {};
  }
  
  getCustomersWithTimesheets(){
    this.customersWithTimesheets = this.db.getData('customers', {orderBy:"hasTimesheets", equalTo: true})
    return this.customersWithTimesheets;
  }
  
  getCustomerProjects(customerId){
    return this.customerProjects = this.db.getData('projects', {orderBy:"customerId", equalTo: customerId.toString()}); 
  }
}
