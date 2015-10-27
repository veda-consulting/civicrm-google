var SIDEBAR_TITLE = 'FIND CONTRIBUTIONS';

// Filters with option values
// dont leave space between filter names --- need to be fixed
// 'TITLE' : 'parameter'
var optFilters = {
  'FinancialTypes'  : 'financial_type_id', 
  'DonationPageID' : 'contribution_page_id',
  'PaymentInstrumentID' : 'payment_instrument_id',
  'DonationStatusID'    : 'contribution_status_id',
  'Currency'  : 'currency',
  'IsPayLater'  : 'is_pay_later'
};


// Filters with textField Values
var textFieldFilters = {
  'DonationID'  : 'id',
  'TotalAmount'  :'total_amount',
}


//Title Row styling
titleRowHeight = 30;
titleHorizontalAlignment = "center";
titleVerticalAlignment = "middle";
titleFontSize   = 13;
titleFontFamily = "Times New Roman";
titleFontWeight = "bold";
titleFontColor  = "black";


// Format texts
function textFormat(sheet, titleRange){
  titleRange.setFontSize(titleFontSize);
  titleRange.setFontFamily(titleFontFamily);
  titleRange.setFontWeight(titleFontWeight);
  titleRange.setFontColor(titleFontColor);
  titleRange.setHorizontalAlignment(titleHorizontalAlignment);
  titleRange.setVerticalAlignment(titleVerticalAlignment);
  sheet.setRowHeight(1, titleRowHeight);  
//  sheet.getRange('D1:E1').merge();
  sheet.setFrozenRows(1);
}
