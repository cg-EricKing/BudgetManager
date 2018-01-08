// ----------------------------------------------------------------------------

// Budget Script
// Created by Eric King
// ----------------------------------------------------------------------------
// Version 0.8
// ----------------------------------------------------------------------------
// ChangeLog
//
// Added Notify function for email
// Rework of conditional logic to account for a max budget based on calculations
// Updated conditional of campaigns that have exceeded montly impression goals
  // Updated decremental variable to multiply by .25 and adjust budget down.
// Created Spreadsheet Template for users to work in - Adds Data from account and has graphs
  // https://docs.google.com/spreadsheets/d/10TDE42Jz6tk5PAstWssNa7OYKDJwNFw_RBXkmN2dFy0/edit?usp=sharing
// Added Spreadsheet to work with variables and tie in with script - no longer need to hard-code script
// Calculating days remaining in the Excel spreadsheet to avoid issues with Date()

function main() {
// Get the Current Account
var currentAccount = AdWordsApp.currentAccount();
var accountName = currentAccount.getName();
//add a comment to see it done
  
// estimated daily impressions needed per day * Avg CPM from last 7 days = new daily budget
var avgCpm = currentAccount.getStatsFor("LAST_7_DAYS");   

// Spreadsheet Start

var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/10TDE42Jz6tk5PAstWssNa7OYKDJwNFw_RBXkmN2dFy0/edit?usp=sharing';

var COLUMN = {
  accountName: 2,
  orderedImpressions: 3,
  email: 4,
  endDate: 5
};

var ROW = 2;

Logger.log('Using spreadsheet - %s.', SPREADSHEET_URL);
var spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
var sheet = spreadsheet.getSheets()[0];
var endRow = sheet.getRange(2,4);
// sheet.clearContents();

 // Get the Current Campaigns in the Account
   var campaignIterator = AdWordsApp.campaigns()
    .withCondition("Status != PAUSED")
    .get();
    Logger.log('Total campaigns found : ' + campaignIterator.totalNumEntities());
    while(campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        Logger.log(campaign.getName());
        // var endDateObject = campaign.getEndDate();
        // var endDateString = string(endDateObject.month + "-" + endDateObject.day + "-" + endDateObject.year);
        
            // Grab the current daily budget
            var currentDailyBudget = campaign.getBudget().getAmount();
            Logger.log("currentDailyBudget: " + currentDailyBudget);

            var currentBiddingStrategy = campaign.getBiddingStrategyType();
            Logger.log("Current bidding strategy: " + currentBiddingStrategy);
          
            var budgetRange = sheet.getRange(13, 2);
            var budgetArray = [[currentDailyBudget]]
            budgetRange.setValues(budgetArray);

    }


var accountName = sheet.getRange(ROW, COLUMN.accountName).getValue() + "$";
var orderedImpressions = sheet.getRange(ROW, COLUMN.orderedImpressions).getValue();
var emailForNotify = sheet.getRange(ROW, COLUMN.email).getValue();
  
Logger.log("Account Name From SS: " + accountName);
Logger.log("Ordered Impressions From SS: " + orderedImpressions);
Logger.log("Email For Notify From SS: " + emailForNotify);



// Email function to pass string and send through to email provided
function notify(string) {
  MailApp.sendEmail(emailForNotify, accountName, string);
}



  // Current Stats at Today's Date
  var currentStats = currentAccount.getStatsFor("THIS_MONTH");
  var currentImpressions = currentStats.getImpressions();
  var currentClicks = currentStats.getClicks();
  var currentConversions = currentStats.getConversions();
  var currentCpm = avgCpm.getAverageCpm();
  var currentCtr = currentStats.getCtr();
  var currentCost = currentStats.getCost();
  var currentConRate = currentStats.getConversionRate();

  var currentStatsValues = [
    [currentImpressions, currentClicks, currentConversions, currentCpm, currentCtr, currentCost, currentConRate]
  ];
  var currentRange = sheet.getRange('B8:H8');
  currentRange.setValues(currentStatsValues);

  Logger.log("avg cpm - last 7 days: " + currentCpm);
  Logger.log("current campaign impressions: " + currentImpressions); 

  // Last Month Stats
  var lastMonthStats = currentAccount.getStatsFor("LAST_MONTH");
  var lastImpressions = lastMonthStats.getImpressions();
  var lastClicks = lastMonthStats.getClicks();
  var lastConversions = lastMonthStats.getConversions();
  var lastAvgCpm = lastMonthStats.getAverageCpm();
  var lastCtr = lastMonthStats.getCtr();
  var lastCost = lastMonthStats.getCost();
  var lastCr = lastMonthStats.getConversionRate();

  var lastMonthStatValues = [
    [lastImpressions, lastClicks, lastConversions, lastAvgCpm, lastCtr, lastCost, lastCr]
  ];
  var lastRange = sheet.getRange('B7:H7');
  lastRange.setValues(lastMonthStatValues);

  // All Time Stats
  var allTimeStats = currentAccount.getStatsFor("ALL_TIME");
  var allImpressions = allTimeStats.getImpressions();
  var allClicks = allTimeStats.getClicks();
  var allConversions = allTimeStats.getConversions();
  var allAvgCpm = allTimeStats.getAverageCpm();
  var allCtr = allTimeStats.getCtr();
  var allCost = allTimeStats.getCost();
  var allCr = allTimeStats.getConversionRate();

  var allTimeStatValues = [
    [allImpressions, allClicks, allConversions, allAvgCpm, allCtr, allCost, allCr]
  ];
  var allRange = sheet.getRange('B9:H9');
  allRange.setValues(allTimeStatValues);
  
  
  // Bidding strategy check
  var biddingStrategySelector = AdWordsApp
  .biddingStrategies();

  var biddingStrategyIterator = biddingStrategySelector.get();
  while (biddingStrategyIterator.hasNext()) {
    var biddingStrategy = biddingStrategyIterator.next();
    Logger.log("Bidding Stragegy: " + biddingStrategy);
  }

// Calculating daily budget
  // Total ordered monthly impressions - current impressions = impressions remaining for the month

  // impressions remaining for the month / days remaining before end of the month = estimated daily impressions needed per day  
  var maxBudget = 20;
  var decrementByPercentage = dailyBudget * .25;

  // New days remaining variable - comes from spreadsheet
  var newDaysRemaining = sheet.getRange(5,2).getValue();
  newDaysRemaining = parseInt(newDaysRemaining);
  Logger.log("New Days Remaining Variable From SS: " + newDaysRemaining);

  // Calculate the number or impressions left for SMALLER ACCOUNTS
  // var impressionsRemaining = orderedImpressions - currentImpressions;
  var impressionsRemaining = orderedImpressions - allImpressions;

    
  // Calculate the number of daily impressions
  var dailyImpressions = impressionsRemaining / newDaysRemaining;
  dailyImpressions = dailyImpressions.toFixed(0);
  var dailyImpressionsRange = sheet.getRange(13,4);
  var dailyImpressionArray = [[dailyImpressions]];
  dailyImpressionsRange.setValues(dailyImpressionArray);
  Logger.log("calcualted daily Impressions: " + dailyImpressions);
    
  // Calculate the daily budget
  var dailyBudget = dailyImpressions / 1000 * currentCpm;
  dailyBudget = dailyBudget.toFixed(2);
  var budgetCalcRange = sheet.getRange(13, 3);
  var dailyBudgetArray = [[dailyBudget]];
  budgetCalcRange.setValues(dailyBudgetArray);
  Logger.log("calculated daily budget: " + dailyBudget);

// This function takes a campaign budget - logs the current budget and sets the new amount of the given 
// budget parameter

  function adjustBudget(budgetToAdjust) {
    var currentCampaigns = AdWordsApp.campaigns().get();
    if(currentCampaigns.hasNext()) {
      var currentBudgetToAdjust = campaign.getBudget();
      Logger.log("current budget: " + currentBudgetToAdjust);
      var getAllBudgetToAdjust = currentBudgetToAdjust.campaigns().get();
      
      while (getAllBudgetToAdjust.hasNext()) {
        var allCampaignsCurrentBudgets = getAllBudgetToAdjust.next();
        allCampaignsCurrentBudgets.getBudget().setAmount(budgetToAdjust);
        Logger.log(allCampaignsCurrentBudgets.getName());
      }
  }
  }

  // Conditional checks to track the budget flow
  if(currentDailyBudget === 0) {
    Logger.log("Budget is 0");
    notify("Budget has depleted for this account - please take a look at the account.");
  }
  else if (currentBiddingStrategy != "MANUAL_CPM") {
    Logger.log("Not a correct bidding strategy for this script - please use the correct script");
    notify("Not a correct bidding strategy for this script - please use the correct script");
  }
  else if(dailyBudget < 0) {
    Logger.log("Daily budget is outside of where we want it to be - may be a negative number " + dailyBudget);
    notify("Budget calculated incorrectly or this account is overdelivering!");
    // adjustBudget(decrementByPercentage);
  }
  else if(dailyImpressions < 0) {
    Logger.log("Daily Impressions have overdelivered");
    if(dailyImpressions > orderedImpressions) {
      Logger.log("Calculated daily impressions are over monthly total...");
      notify("Calculated daily impressions have exceeded the monthly total - please take a look at this account");
      adjustBudget(decrementByPercentage);
    }
  }
  else if (dailyBudget > 25) {
    Logger.log("Budget has calculated over an amount of $25 - adjusting to max budget amount of $20");
    adjustBudget(dailyBudget);
  }
  else if(currentDailyBudget > dailyBudget) {
    Logger.log("Budget has increased over daily calculated budget - adjusting ...");
    adjustBudget(dailyBudget);
    notify("Budget has increased over the daily calculated budget and has been adjusted for this account");
  } 
  else if(currentDailyBudget < dailyBudget) {
    Logger.log("Budget has decreased over daily calculated budget - adjusting ...");
    adjustBudget(dailyBudget);
    notify("Budget has decreased below the daily calculated budget and has been adjusted for this account.");
  }
  else {
    Logger.log("Budget is holding - no adjustment necessary")
  }
}