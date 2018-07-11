// Updated budget script for larger accounts - looks at all time stats for daily budget calculations.

// Select the current account
// Initialize the spreadsheet and connect
// Grab the entered ordered impressions, notification email, days remaining - needed for calculations
// Select the current campaigns that are ENABLED
// After selecting the current enabled campaign - Iterate to find out if more then 1 campaign is running
// Once the current campaign(s) have been selected grab the stat values needed from that campaign
// Send the stats to their own 2d array - select the right cell values to place the stats into the spreadsheet
// Calculate the daily budget for the current campaign(s) - including daily impressions calculations
// Write a function to adjust the current budget to the calulated daily budget
// Create use case conditional logic for the following
    // - daily budget === 0
    // - current bidding strategy != "MANUAL_CPM"
    // - daily budget < 0
    // - daily impressions < 0
    // - daily budget > 25
    // - current daily budget > daily budget
    // - current daily budget < daily budget
    // - current daily budget === daily budget

    function main() {
        // select current account - get account name and return it
            var currentAccount = AdWordsApp.currentAccount();
            var accountName = currentAccount.getName();
    
        // spreadsheet init
    // ****************************************************** EDIT HERE ONLY ****************************************
            // add spreadsheet link here
            var spreadsheet_url = 'https://docs.google.com/spreadsheets/d/19Yxqs5uguoZ4rVU7eN4eFFt_DCvcIjyXtMnZ1C0jBds/edit?usp=sharing';
    // ****************************************************************************************************************        
                var headerColumn = {
                    accountName: 2,
                    orderedImpressions: 3,
                    email: 4,
                    endDate: 5
                };
            
                var startRow = 2;
                // Log spreadsheet url
                Logger.log('Using spreadsheet - %s.', spreadsheet_url);
                // open ss
                var spreadsheet = SpreadsheetApp.openByUrl(spreadsheet_url);

    // ********************************** EDIT HERE ONLY ****************************************************************            
                // init sheet - update for the sheet number - sheets start at 0 and go up by 1
                var sheet = spreadsheet.getSheets()[0];
    // ******************************************************************************************************************
    
    
        // Grab SS Data
            var accountName = "$" + " " + sheet.getRange(startRow, headerColumn.accountName).getValue();
            var orderedImpressions = sheet.getRange(startRow, headerColumn.orderedImpressions).getValue();
            var emailForNotify = sheet.getRange(startRow, headerColumn.email).getValue();
              
            Logger.log("Account Name From DH API: " + accountName);
            Logger.log("Ordered Impressions From DH API: " + orderedImpressions);
            Logger.log("Email For Notify From DH API: " + emailForNotify);
        
        // **** URL Fetch
        // var accountName = '';
        // var orderedImpressions = 0;
        // var emailForNotify = '';

        // var apiKey = '';

        // var apiUrl = '' + apiKey;

        // var response = UrlFetchApp.fetch(apiUrl);
        // var json = response.getContentText();
        // var fetchData = JSON.parse(json);
        // Logger.log(fetchData);
    
        // Logger.log("Account Name From DH API: " + accountName);
        // Logger.log("Ordered Impressions From DH API: " + orderedImpressions);
        // Logger.log("Email For Notify From DH API: " + emailForNotify);
    
    
    
        // Email function to pass string and send through to email provided
        function notify(string) {
        // Construct email template for notifications
        // Must have to, subject, htmlBody
        var emailTemplate = {
            to: emailForNotify,
            subject: accountName,
            htmlBody: "<h1>Comporium Media Services Automation Scripts</h1>" + "<br>" + "<p>This account has encountered an issue</p>" + accountName +
            "<br>" + "<p>The issue is with this campaign: </p>" + campaignName + "<br>" + "<p>This is what is wrong - </p>" + "<br>"
            + string + "<p>Total Impressions Currently: " + avgImpressions + "<br>" +"<p>If something is incorrect with this notification please reply to this email. Thanks!</p>"
        }
            MailApp.sendEmail(emailTemplate);
        }


    
        // Get the current Campaign in the account
            // Add another condition filter to grab a specific campaign running (Pacing Label on campaign)
            var campaignSelector = AdWordsApp
            .campaigns()
            .withCondition("Status = ENABLED");
    
            var campaignIterator = campaignSelector.get();
            while(campaignIterator.hasNext()) {
                var campaign = campaignIterator.next();
                var campaignName = campaign.getName();
                Logger.log(campaignName);
    
                var currentDailyBudget = campaign.getBudget().getAmount();
                Logger.log("current daily budget: " + currentDailyBudget);
    
                var currentBiddingStrategy = campaign.getBiddingStrategyType();
                Logger.log("current bidding strategy: " + currentBiddingStrategy);
    
                var budgetRange = sheet.getRange(13,2);
                var budgetArray = [[currentDailyBudget]];
                budgetRange.setValues(budgetArray);
    
                var avgCpm = campaign.getStatsFor("LAST_7_DAYS");
                var avgImpressions = avgCpm.getImpressions();
                var currentCpm = avgCpm.getAverageCpm();
                var cpmRange = sheet.getRange(13,5);
                var cpmArray = [[currentCpm]];
                cpmRange.setValues(cpmArray);
                Logger.log("current cpm: " + currentCpm);
                
                // current stats
                var currentStats = campaign.getStatsFor("THIS_MONTH");
                var currentImpressions = currentStats.getImpressions();
                var currentClicks = currentStats.getClicks();
                var currentCost = currentStats.getCost();
                var currentCtr = currentStats.getCtr();
                var currentCpc = currentStats.getAverageCpc();
                var currentConversions = currentStats.getConversions();
                var currentCpm = currentStats.getAverageCpm();
    
                var currentArray = [[currentImpressions, currentClicks, currentCost, currentCtr, currentCpc, currentCpm]];
                var currentRange = sheet.getRange('B8:G8');
                currentRange.setValues(currentArray);
                Logger.log("Current stats: " + currentArray);
                // all time stats
                var allStats = campaign.getStatsFor("ALL_TIME");
                var allImpressions = allStats.getImpressions();
                var allClicks = allStats.getClicks();
                var allCost = allStats.getCost();
                var allCtr = allStats.getCtr();
                Logger.log("All CTR for Max Clicks Check - " + allCtr);
                var allCpc = allStats.getAverageCpc();
                Logger.log("All CPC for Max Clicks Check - " + allCpc);
                var allConversions = allStats.getConversions();
                var allCpm = allStats.getAverageCpm();
    
                var allArray = [[allImpressions, allClicks, allCost, allCtr, allCpc, allCpm]];
                var allRange = sheet.getRange('B9:G9');
                allRange.setValues(allArray);
                Logger.log("All time array: " + allArray);
                // last month stats
                var lastStats = campaign.getStatsFor("LAST_MONTH");
                var lastImpressions = lastStats.getImpressions();
                var lastClicks = lastStats.getClicks();
                var lastCost = lastStats.getCost();
                var lastCtr = lastStats.getCtr();
                var lastCpc = lastStats.getAverageCpc();
                var lastConversions = lastStats.getConversions();
                var lastCpm = lastStats.getAverageCpm();
    
                var lastArray = [[lastImpressions, lastClicks, lastCost, lastCtr, lastCpc, lastCpm]];
                var lastRange = sheet.getRange('B7:G7');
                lastRange.setValues(lastArray);
                Logger.log("Last month stats: " + lastArray);
        }
    
            // Calculating daily budget
            // Total ordered impressions - all time impressions = impressions remaining for the month
    
            // impressions remaining for the month / days remaining before end of the month = estimated daily impressions needed per day  
            var maxBudget = 20;
            var minBudget = .50;
            // Need to figure out a higher decrement variable - work in a way to to have different decremental values
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

        var endsSoonYes = 'Yes';
        var endsSoonNo = "No";

        var endsRange = sheet.getRange(17,4);
        var endsArray = [[endsSoonYes]];
        endsRange.setValues(endsArray);

        var accountFlagRange = sheet.getRange(17,3);
    
    
    
        if(currentDailyBudget === 0) {
            Logger.log("Budget is 0");
            notify("Budget has depleted for this account - please take a look at the account.");
            var depletedFlag = [["Budget depleted"]];
            accountFlagRange.setValues(depletedFlag);
          }
          else if (currentBiddingStrategy != "MANUAL_CPM") {
            Logger.log("Not a correct bidding strategy for this script - please use the correct script");
            notify("Not a correct bidding strategy for this script - please use the correct script");
            var bidStratFlag = [["Not a correct Bidding Strategy!"]];
            accountFlagRange.setValues(bidStratFlag);
          }
          else if(dailyBudget < 0) {
            Logger.log("Daily budget is outside of where we want it to be - may be a negative number " + dailyBudget);
            notify("Budget calculated incorrectly or this account is overdelivering!");
            var overdeliveringFlag = [["Campaign Overdelivering!"]];
            accountFlagRange.setValues(overdeliveringFlag);
            // adjustBudget(decrementByPercentage);
          }
          else if(dailyImpressions < 0) {
            Logger.log("Daily Impressions have overdelivered");
            notify("Daily impression calculations indicates campaign is overdelivering");
            var dailyImpressionFlagRange = sheet.getRange(15, 4);
            var dailyImpressionFlag = [["Over delivering!"]];
            dailyImpressionFlagRange.setValues(dailyImpressionFlag);
            // Add a better flag to spreadsheet
          }
          else if(allImpressions > orderedImpressions) {
            Logger.log("Calculated daily impressions are over impression goal...");
            notify("All time impressions have exceeded the overall goal - budget adjusted to .50");
            var totalImpressionFlag = [["Impressions exceed goal."]];
            accountFlagRange.setValues(totalImpressionFlag);
            adjustBudget(minBudget);
          }
          else if (dailyBudget > 25) {
            Logger.log("Budget has calculated over an amount of $25 - adjusting to max budget amount of $20");
            notify("Daily budget calculated over $25 max budget - budget adjusted to $20, please double check to see if this is correct");
            adjustBudget(maxBudget);
            var maxBudgetFlag = [["Calculated over max"]];
            accountFlagRange.setValues(maxBudgetFlag);
          }
          else if(dailyBudget < minBudget) {
            Logger.log("Budget calculated below .50 - adjust to .50");      
            adjustBudget(minBudget);
          }
          else if(currentDailyBudget > dailyBudget) {
            Logger.log("Budget has increased over daily calculated budget - adjusting ...");
            adjustBudget(dailyBudget);
            //notify("Budget has increased over the daily calculated budget and has been adjusted for this account");
          } 
          else if(currentDailyBudget < dailyBudget) {
            Logger.log("Budget has decreased over daily calculated budget - adjusting ...");
            adjustBudget(dailyBudget);
            //notify("Budget has decreased below the daily calculated budget and has been adjusted for this account.");
          }
          else {
            Logger.log("Budget is holding - no adjustment necessary")
          }
    }