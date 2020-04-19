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
function onHomepage(e) {
  console.log(e);
  var hour = Number(Utilities.formatDate(new Date(), e.userTimezone.id, 'H'));
  var message;
  if (hour >= 6 && hour < 12) {
    message = 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    message = 'Good afternoon';
  } else {
    message = 'Good night';
  }
  message += ' ' + e.hostApp;
  return createHomeCard();
}

function createHomeCard(){
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
 
  
  // Assemble the widgets and return the card.
  let section1 = CardService.newCardSection()
      .addWidget(startDatePicker)
      .addWidget(endDatePicker);
  
  
    
  
   
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
