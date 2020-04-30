function onHomepage(e) {
  let homeCard = buildHomeCard();  
  return homeCard.build();
}

function buildHomeCard(selectedCompany){
  let cardHeader = buildCardHeader();
  let cardSection1 = buildHomeCardSection1(selectedCompany);
  
  let homeCard = CardService.newCardBuilder()
  .setName("Home Card")
  .setHeader(cardHeader)
  .addSection(cardSection1);
  myLog('Building home card: ' + JSON.stringify(homeCard)) 
  
  return homeCard;  
}

function buildCardHeader(){
  let cardHeader = CardService.newCardHeader()
  .setTitle("Projects")
  .setImageStyle(CardService.ImageStyle.CIRCLE)
  .setImageUrl("https://res-2.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco/v1423516711/gmr0yvf7endyoezjvlgm.jpg") // TSheets logo
  
  return cardHeader;
}

 function buildHomeCardSection1(selectedCompany){
    
    let db = new dbOperations();
    let customersWithTimesheets = db.getCustomersWithTimesheets(); 
    
    let companySelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Company")
    .setFieldName("selected_company");
   
    for(let customerName in customersWithTimesheets){
      if(selectedCompany == customersWithTimesheets[customerName].id){
        companySelection.addItem(customerName, customersWithTimesheets[customerName].id, true)
      } else {
        companySelection.addItem(customerName, customersWithTimesheets[customerName].id, false)
      }      
    }
   
    companySelection.setOnChangeAction(CardService.newAction()
                                       .setFunctionName("buildHomeCardSection2")
                                       .setLoadIndicator(CardService.LoadIndicator.SPINNER));
   
    
   let homeCardSection1 = CardService.newCardSection().addWidget(companySelection);
   return homeCardSection1;
  }
  
 
  function buildHomeCardSection2(e){
   
    let companyId = e.formInputs.selected_company;
    
    let homeCardSection2 = CardService.newCardSection();
      
    let db = new dbOperations();
    let projects = db.getCustomerProjects(companyId);
  
    myLog('projects for '+ companyId + ':' + JSON.stringify(projects))
    let index = 0;
    for(let k in projects){
      index++;
      let project = projects[k];
      
      let multilineKeyValue = CardService.newKeyValue()
      .setIconUrl("https://ui-avatars.com/api/?name=" + index + "&size=128&font-size=0.8&rounded=true")
      .setTopLabel("total cost: $" + project.totalCost.toFixed(2) + " / total hours: " + project.totalHours.toFixed(2) + 'h')
      .setContent(project.name)
      .setMultiline(true)
      .setBottomLabel("start date here")
      
      homeCardSection2.addWidget(multilineKeyValue)
    }
      
    let homeCard = buildHomeCard(companyId);
    myLog(JSON.stringify(homeCard))
    homeCard.addSection(homeCardSection2);
    
    
    
    let nav = CardService.newNavigation().updateCard(homeCard.build());
    return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
  }
  

