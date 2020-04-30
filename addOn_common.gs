/**
 * This simple G Suite add-on shows a random image of a cat in the sidebar. When
 * opened manually (the homepage card), some static text is overlayed on
 * the image, but when contextual cards are opened a new cat image is shown
 * with the text taken from that context (such as a message's subject line)
 * overlaying the image. There is also a button that updates the card with a
 * new random cat image.
 *
 * Click "File > Make a copy..." to copy the script, and "Publish > Deploy from
 * manifest > Install add-on" to install it.
 */

/**
 * The maximum number of characters that can fit in the cat image.
 */
var MAX_MESSAGE_LENGTH = 40;

/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */

var addOn = {};
//function onHomepage(e) {
//  myLog(e);
//  addOn = new addOnCommon();
//  let homeCard = addOn.buildHomeCard();
//  
//  return homeCard.build();
//}

class addOnCommon{
  constructor(){
    this.cardHeader = {};
    this.homeCard = {};
    this.homeCardSection1 = {};
    this.homeCardSection2 = {};
    
    this.db = new dbOperations();
    
  }
  
   buildHomeCard(selectedCompany){
    this.buildCardHeader();
    this.buildHomeCardSection1(selectedCompany);
    //section 2 is created after the dropdown from section 1 selected action is executed
    this.homeCard = CardService.newCardBuilder()
    .setName("Home/Navigation Card")
    .setHeader(this.cardHeader)
    .addSection(this.homeCardSection1)
    
    //.build();
  
    return this.homeCard;
  }
  
  updateCard(card){
    let nav = CardService.newNavigation().updateCard(card);
    return CardService.newActionResponseBuilder()
        .setNavigation(nav)
        .build();
  }
  
  buildCardHeader(){
    this.cardHeader = CardService.newCardHeader()
    .setTitle("Projects")
    //.setSubtitle("Here you can define a date range which the program will use to pull time sheets from TSheets. ")
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl("https://res-2.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco/v1423516711/gmr0yvf7endyoezjvlgm.jpg") // TSheets logo
  }
  
 
   
  
  buildHomeCardSection1(selectedCompany){
    let startDatePicker = CardService.newDatePicker()
    .setTitle("Enter the start date.")
    .setFieldName("param1")
    // Set default value as Jan 1, 2018 UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    .setOnChangeAction(CardService.newAction()
                       .setFunctionName("addOnClassProxy")
                       .setParameters({function:"dateTimeChange"}));
    
    let endDatePicker = CardService.newDatePicker()
    .setTitle("Enter the end date.")
    .setFieldName("param2")
    // Set default value as Jan 1, 2018 UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    .setOnChangeAction(CardService.newAction()
                       .setFunctionName("addOnClassProxy")
                       .setParameters({function:"dateTimeChange"}));  
    
    
    
    let customersWithTimesheets = this.db.getCustomersWithTimesheets(); 
    
    let companySelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Company")
    .setFieldName("param1");
    for(let customerName in customersWithTimesheets){
      if(selectedCompany == customersWithTimesheets[customerName].id){
        companySelection.addItem(customerName, customersWithTimesheets[customerName].id, true)
      } else {
        companySelection.addItem(customerName, customersWithTimesheets[customerName].id, false)
      }
      
    }
    companySelection.setOnChangeAction(CardService.newAction()
                                       .setFunctionName("addOnClassProxy")
                                       .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                                       .setParameters({function:"companySelection"}));
    
    this.homeCardSection1 = CardService.newCardSection()
      .addWidget(startDatePicker)
      .addWidget(endDatePicker)
      .addWidget(companySelection);
  }
  
  handleDateTimeChange(date, which){
  }
  
  handleCompanySelection(companyId){
    myLog('in company selection handler');
    //var companyId = res['selected_company'];
    
    this.homeCardSection2 = CardService.newCardSection();
      
   
    var projects = this.db.getCustomerProjects(companyId); 
    myLog(JSON.stringify(projects))
    //let multilineKeyValue = {};
  
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
      
      this.homeCardSection2.addWidget(multilineKeyValue)
    }
      
      this.homeCard = this.buildHomeCard(companyId);
      this.homeCard.addSection(this.homeCardSection2);
      return this.updateCard(this.homeCard.build());
      
    
 
  }
  
}

function addOnClassProxy(e){ // can't assign a this.[method_name] to a card action, this proxy helps resolve the problem
  myLog('in proxy, e: ' + JSON.stringify(e));
  
  addOn = new addOnCommon();
  let homeCard = addOn.buildHomeCard();
  
  let functionToExec = e.parameters.function
  var inputs = e.formInputs;
  //var functionToExec = params['function'];
  
  let param1 = '';
  let param2 = '';
  
  if(inputs.hasOwnProperty('param1')){
    param1 = inputs['param1'][0];
  }
  
  if(inputs.hasOwnProperty('param2')){
    param2 = inputs['param2'][0];
  }
  
  myLog('function: ' + functionToExec + ', param: ' + param1)
  //let param = params['param']
  myLog('addOn: ' + JSON.stringify(addOn));
  switch(functionToExec){
      
    case 'dateTimeChange':
      if(param1!=''){
        addOn.handleDateTimeChange(param1, 'start');
      } else if(param2!=''){
        addOn.handleDateTimeChange(param2, 'end');
      }
      
      break;
      
    case 'companySelection':
      if(param1!=''){
        myLog('executing company selection ' + param1);
        return addOn.handleCompanySelection(param1);
      }
      
      break;
  }
  
}



function createHomeCard(){
  let db = new dbOperations();
  let customersWithTimesheets = db.getCustomersWithTimesheets(); 
  
  //create card header
   let cardHeader = CardService.newCardHeader()
    .setTitle("Projects")
    .setSubtitle("Here you can define a date range which the program will use to pull time sheets from TSheets. ")
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl("https://res-2.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco/v1423516711/gmr0yvf7endyoezjvlgm.jpg") // TSheets logo
   
   
   //create date choice widgets in one section
   var startDatePicker = CardService.newDatePicker()
    .setTitle("Enter the start date.")
    .setFieldName("date_start_field")
    // Set default value as Jan 1, 2018 UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleDateTimeChange"));
  
  var endDatePicker = CardService.newDatePicker()
    .setTitle("Enter the end date.")
    .setFieldName("date_end_field")
    // Set default value as Jan 1, 2018 UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleDateTimeChange"));  
 
  var companySelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Company")
    .setFieldName("selected_company");
  for(let customerName in customersWithTimesheets){
    companySelection.addItem(customerName, customersWithTimesheets[customerName].id, false)
  }
  companySelection.setOnChangeAction(CardService.newAction()
        .setFunctionName("handleCompanySelection")
        .setParameters({comapnySelected: companySelection.company_field}));
  
  // Assemble the widgets and return the card.
  let section1 = CardService.newCardSection()
      .addWidget(startDatePicker)
      .addWidget(endDatePicker)
      .addWidget(companySelection);
  
  
    
  
   
   let multilineKeyValue = CardService.newKeyValue()
    .setIconUrl("https://ui-avatars.com/api/?name=John+Doe&size=128&font-size=0.8&rounded=true")
    .setTopLabel("Top label - single line")
    .setContent("Content can be multiple lines")
    .setMultiline(true)
    .setBottomLabel("Bottom label - single line")
    //.setOnClickAction(action);
  
   
   var section2 = CardService.newCardSection()
      .addWidget(multilineKeyValue)
      
   
   let card = CardService.newCardBuilder()
    .setName("Home/Navigation Card")
    .setHeader(cardHeader)
    .addSection(section1)
    .addSection(section2)
    .build();
  
  return card;
}



function homeCards(){
  let cards = [];
  for(let i=0; i<3; i++){
   
    let textParagraph = CardService.newTextParagraph()
    .setText("This is a text paragraph widget. Multiple lines are allowed if needed.");
    let imageKeyValue = CardService.newKeyValue()
    .setIconUrl("https://icon.png")
    .setContent("KeyValue widget with an image on the left and text on the right");

    let textKeyValue = CardService.newKeyValue()
    .setTopLabel("Text key")
    .setContent("KeyValue widget with text key on top and cotent below");

    let multilineKeyValue = CardService.newKeyValue()
    .setIconUrl("https://icon.png")
    .setContent("KeyValue widget with an image on the left and text on the right")
    .setTopLabel("Top label - single line")
    .setContent("Content can be multiple lines")
    .setMultiline(true)
    .setBottomLabel("Bottom label - single line")
    .setOnClickAction(action)
    
     let cardSection = CardService.newCardSection()
     .addWidget(textParagraph)
     .addWidget(imageKeyValue)
     .addWidget(textKeyValue)
     .addWidget(multilineKeyValue)
     
     let cardHeader = CardService.newCardHeader()
    .setTitle("Card header title " + i)
    .setSubtitle("Card header subtitle")
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl("https://image.png")
    
     
    let card = CardService.newCardBuilder()
    .setName("Card name")
    .setHeader(cardHeader)
    .addSection(cardSection)
    .build();
    
    cards.push(card);
  }
  return cards;
  
}

/**
 * Creates a card with an image of a cat, overlayed with the text.
 * @param {String} text The text to overlay on the image.
 * @param {Boolean} isHomepage True if the card created here is a homepage;
 *      false otherwise. Defaults to false.
 * @return {CardService.Card} The assembled card.
 */
function createCatCard(text, isHomepage) {
  // Explicitly set the value of isHomepage as false if null or undefined.
  if (!isHomepage) {
    isHomepage = false;
  }

  // Use the "Cat as a service" API to get the cat image. Add a "time" URL
  // parameter to act as a cache buster.
  var now = new Date();
  // Replace formward slashes in the text, as they break the CataaS API.
  var caption = text.replace(/\//g, ' ');
  var imageUrl = 'https://drive.google.com/thumbnail?id=1S97SiKLuWrsbRU_DL738Xh3IPRTWiOFh';//https://drive.google.com/file/d/1S97SiKLuWrsbRU_DL738Xh3IPRTWiOFh/view?usp=sharing
      //Utilities.formatString('https://cataas.com/cat/says/%s?time=%s',
       //   encodeURIComponent(caption), now.getTime());
  var image = CardService.newImage()
      .setImageUrl(imageUrl)
      .setAltText('Skynet')



  var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("A group of checkboxes. Multiple selections are allowed.")
    .setFieldName("checkbox_field")
    .addItem("checkbox one title", "checkbox_one_value", false)
    .addItem("checkbox two title", "checkbox_two_value", true)
    .addItem("checkbox three title", "checkbox_three_value", true)
    .setOnChangeAction(CardService.newAction()
    .setFunctionName("handleCheckboxChange"));

  var startDatePicker = CardService.newDatePicker()
    .setTitle("Enter the start date.")
    .setFieldName("date_field")
    // Set default value as Jan 1, 2018 UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleDateTimeChange"));
  
  var endDatePicker = CardService.newDatePicker()
    .setTitle("Enter the end date.")
    .setFieldName("date_field")
    // Set default value as Jan 1, 2018 UTC. Either a number or string is acceptable.
    .setValueInMsSinceEpoch(1514775600)
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleDateTimeChange"));
  
  // Create a footer to be shown at the bottom.
  
  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
      //.addWidget(image)
      
      .addWidget(checkboxGroup)
      .addWidget(startDatePicker)
      .addWidget(endDatePicker);
  
  
    // Create a button that changes the cat image when pressed.
  // Note: Action parameter keys and values must be strings.
  var action = CardService.newAction()
      .setFunctionName('onChangeCat')
      .setParameters({text: text, isHomepage: isHomepage.toString()});
  var button = CardService.newTextButton()
      .setText('Change cat')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);
  var section2 = CardService.newCardSection()
  .addWidget(buttonSet)
  
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
          .setText('Powered by cataas.com')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('https://cataas.com')));
  
  var card = CardService.newCardBuilder()
      .addSection(section)
  .addSection(section2)
      .setFixedFooter(footer);

  if (!isHomepage) {
    // Create the header shown when the card is minimized,
    // but only when this card is a contextual card. Peek headers
    // are never used by non-contexual cards like homepages.
    var peekHeader = CardService.newCardHeader()
      .setTitle('Contextual Cat')
      .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/pets_black_48dp.png')
      .setSubtitle(text);
    card.setPeekCardHeader(peekHeader)
  }

  return card.build();
}

/**
 * Callback for the "Change cat" button.
 * @param {Object} e The event object, documented {@link
 *     https://developers.google.com/gmail/add-ons/concepts/actions#action_event_objects
 *     here}.
 * @return {CardService.ActionResponse} The action response to apply.
 */
function onChangeCat(e) {
  console.log(e);
  // Get the text that was shown in the current cat image. This was passed as a
  // parameter on the Action set for the button.
  var text = e.parameters.text;

  // The isHomepage parameter is passed as a string, so convert to a Boolean.
  var isHomepage = e.parameters.isHomepage === 'true';

  // Create a new card with the same text.
  var card = createCatCard(text, isHomepage);

  // Create an action response that instructs the add-on to replace
  // the current card with the new one.
  var navigation = CardService.newNavigation()
      .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
      .setNavigation(navigation);
  return actionResponse.build();
}

/**
 * Truncate a message to fit in the cat image.
 * @param {string} message The message to truncate.
 * @return {string} The truncated message.
 */
function truncate(message) {
  if (message.length > MAX_MESSAGE_LENGTH) {
    message = message.slice(0, MAX_MESSAGE_LENGTH);
    message = message.slice(0, message.lastIndexOf(' ')) + '...';
  }
  return message;
}

