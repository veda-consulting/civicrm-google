
ss = SpreadsheetApp.getActiveSpreadsheet();
spreadsheetTimeZone = ss.getSpreadsheetTimeZone();
sheets = ss.getSheets();
defaultSheet = sheets[0];

titles = [];

function onInstall(){
  onOpen();
}

function onOpen() {
  resetData();
  var menuEntries = [ {name: "Search Contributions", functionName: "civiEntryPoint"}, {name: "Clear Data", functionName: "resetData"}];
  ss.addMenu("CiviCRM", menuEntries);
//  civiEntryPoint();  
}


function civiEntryPoint(){
  if(areKeysExist()){
    Logger.log("keys exists");
//    getData();
    requestAndHandleData();
//    HTMLToOutput = '<html><h1>Contacts List updated</h1></html>';
//    SpreadsheetApp.getActiveSpreadsheet().show(HtmlService.createHtmlOutput(HTMLToOutput));
  }
  else{
    areKeysExist();
  }  
}

function areKeysExist() {
//  var civicrmURL = UserProperties.getProperty(civicrmURLPropertyName);
  var api_key  = UserProperties.getProperty(apiKeyPropertyName);
  var site_key = UserProperties.getProperty(siteKeyPropertyName);
  if(!api_key || !site_key){ //if any of the keys are empty or undefined
    Logger.log(" keys missing");
    getAndStoreKeys(); // get and store keys
  }
  return true; //naive check
}

//this is the user property where we'll store the keys, make sure this is unique across all user properties across all scripts
//var civicrmURLPropertyName = 'CIVICRM_RESOURCE_URL';
var apiKeyPropertyName = 'CIVI_API_KEY';
var siteKeyPropertyName = 'CIVI_SITE_KEY';

function getAndStoreKeys(){
  Logger.log("getting keys to store");
//  var civicrmURL = Browser.inputBox('Enter civicrm Resource URL', Browser.Buttons.OK_CANCEL);
//  UserProperties.setProperty(civicrmURLPropertyName, civicrmURL);
  var api_key = Browser.inputBox('Enter api key', Browser.Buttons.OK_CANCEL);
  UserProperties.setProperty(apiKeyPropertyName, api_key);
  var site_key = Browser.inputBox('Enter site key', Browser.Buttons.OK_CANCEL);
  UserProperties.setProperty(siteKeyPropertyName, site_key);
}

function resetKeys(){
  UserProperties.deleteProperty(apiKeyPropertyName);
  UserProperties.deleteProperty(siteKeyPropertyName);
  
  // go back to entry point
  civiEntryPoint();
}

function requestAndHandleData() {
  var response = getFields();
  var responseCode = response.getResponseCode();
  Logger.log("response code" + responseCode);
  
  if (responseCode < 300){
    showSidebar();
    var apiResponse = response.getContentText();
    setTitles(apiResponse);
    
  }else if (responseCode == 401){
    // reset stored keys
    resetKeys();
    
  }else{
    Browser.msgBox("Error " + responseCode + ": " + response.getContentText());
  }
  
}


// ftech URL with stored key values
function fetchURL(entity, action, payload){
  ////  var civicrmURL = UserProperties.getProperty(civicrmURLPropertyName);
  var api_key  = UserProperties.getProperty(apiKeyPropertyName);
  var site_key = UserProperties.getProperty(siteKeyPropertyName);
  
  var url = 'http://mailchimp.vedaconsulting.co.uk/sites/all/modules/civicrm/extern/rest.php?entity='+entity+'&action='+action+payload+'&api_key='+api_key+'&key='+site_key+'&json=1';

  Logger.log(entity + ' : ' + url);
  var response = UrlFetchApp.fetch(url);

  return response;
}


// get Fields from contribution
function getFields(){
  
  var entity = "Contribution";  
  var action = "get";  
  var payload = "";
  
  var response = fetchURL(entity, action, payload);

  return response; 
}

// set titles
function setTitles(apiResponse) {
  
  var fieldsArray = JSON.parse(apiResponse).values;
  
  var titles = [];
  
  //get first record to get all params
  for(var key in fieldsArray) break;  
  var field = fieldsArray[key];
  
  // if filter values returns no value return
  if (typeof field == 'undefined') {
    return;
  }
  
  // gather all params into title array
  titles = Object.keys(field);
  
  var numofTitles = titles.length;
  
  var titlesArray = ([titles]);  
  var titleRange =  defaultSheet.getRange(1, 1, 1, numofTitles);
  titleRange.setValues(titlesArray); 
  
  textFormat(defaultSheet, titleRange);
  
  return [titles, numofTitles];
  
}


function getData(payloadFilter){
  resetData();
  // get contributions
  var entity = "Contribution";
  var action = "get";  
//  var financialTypeId = contributionType;  
  var payload = '&options[limit]='+payloadFilter;
  var response = fetchURL(entity, action, payload);

  var apiResponse = response.getContentText();
  
  runSOQL(apiResponse);

//  HTMLToOutput = '<html><h1>Contacts List updated</h1></html>';
//   SpreadsheetApp.getActiveSpreadsheet().show(HtmlService.createHtmlOutput(HTMLToOutput));  
}


// contributions
function runSOQL(apiResponse){
  
  //get parameters and number of parameters from titles function
  var titleFields = setTitles(apiResponse);
  
  // if titleFields undefined return
  if (typeof titleFields == 'undefined') {
    Browser.msgBox('No records found with these filter options!');
    return;
  }
  
  var titles = titleFields[0];
  var numofColumns = titleFields[1]; 
   
  var numofContributions = JSON.parse(apiResponse).count;
  Browser.msgBox(numofContributions+ ' contributions found');
  
  var contributionsArray = JSON.parse(apiResponse).values;  
    
  var data = [];  
  //loop through each contribution
  for (var key in contributionsArray) {
   if (contributionsArray.hasOwnProperty(key)) {
     var contribution = contributionsArray[key];     
     
     var row = [];
     for(i=0; i<numofColumns; i++){
       var param = titles[i];
       row.push(contribution[param]);
     }
     
     data.push(row);

//       row.push([contribution['contribution_id'], contribution['display_name'], contribution['contact_id'], contribution['total_amount'], contribution['contribution_source'], contribution['financial_type']]);
    }
  }
  
//  Browser.msgBox(data);
  
//  resetData();
  dataRange = defaultSheet.getRange(2, 1, numofContributions, numofColumns);
  dataRange.setValues(data);
  
  return numofContributions;
}


// get filter options by filterParam and send back to SideBar->callFilterOptions()
function getFilterOptions(filterName, filterParam){

  var entity = "Contribution";
  var action = "getoptions";
  var payload = '&field='+filterParam;  
    
  var response = fetchURL(entity, action, payload);
 
  var apiResponse = response.getContentText();
  
  var optionsArray = JSON.parse(apiResponse).values;
    
  var filtersArray = [],
      valuesArray = [];
    
  for(var key in optionsArray){
    if (optionsArray.hasOwnProperty(key)){      
      filtersArray.push([optionsArray[key]]);
      valuesArray.push(key);
    }
  }
  
//  filtersArray.push([filtersArray]);
//  Browser.msgBox('filter array in getFilterOptions : ' +filtersArray);
  var filterOptions = [filterName, filtersArray, valuesArray];
  return filterOptions; 
  
}



// return option filters
function optionFilters(){
  var optionFilters = optFilters;
//  Browser.msgBox('customFilters' +customFilters);
  return optionFilters;
}


// return textFiledFilters
function inputFilters(){
  var inputFilters = textFieldFilters;
  return inputFilters;
}

// return all filters
function allFilters(){
  var allFilters = textFieldFilters;
  var optionFilters = optFilters;
  
  for (var key in optionFilters){
    if (optionFilters.hasOwnProperty(key))
      allFilters[key] = optionFilters[key]
  }
  
  return allFilters;
}