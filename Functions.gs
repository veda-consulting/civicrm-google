// clear active sheet contents
function resetData(){  
  var dataRange = defaultSheet.getRange(2, 1, defaultSheet.getLastRow(), defaultSheet.getLastColumn());
  dataRange.clearContent(); 
}

// Display Sidebar on the Spreadsheet
function showSidebar() {
  var ui = HtmlService.createTemplateFromFile('Sidebar')
      .evaluate()
      .setTitle(SIDEBAR_TITLE);
  SpreadsheetApp.getUi().showSidebar(ui);
}

// get selected value
function getSelectedValue(contributionType) {
  return contributionType;
}
