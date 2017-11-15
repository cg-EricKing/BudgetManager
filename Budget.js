// Budget Script


// Get the Current Account - .currentAccount()
// Get the Current Campaign - AdWordsApp.campaigns().get();
// Total Impressions Ordered - Hard Coded
// Current Impressions at todays date - stats.getImpressions();
// Calculate Total Days - dateDiffInDays();
// Calcualte Remaining Impressions - (currentImpressions - orderedImpressions)
// Calculate Daily Impressions - remainingImpression / remaningDays
// Calculate Daily Budget - (currentImpressions / 1000 * 1.25)
// Get current Campaign Daily Budget - campaign.getBudget().getAmount();
// ==== Conditional Checks ====
// check daily budget for current campaign
  // if the budget is === 0 exit
  // else if the daily budget is above the calculated daily budget => adjust campaign.getBudget.setAmount(dailyBudget); 
  // else if the daily budget falls below the calculated daily budget => adjust campaign.getBudget.setAmount(dailyBudget);



  function main() {
    // Get the Current Account
    var currentAccount = AdWordsApp.currentAccount();
    
    
    // Get the Current Campaigns in the Account
     var campaignIterator = AdWordsApp.campaigns().get();
      Logger.log('Total campaigns found : ' + campaignIterator.totalNumEntities());
      while(campaignIterator.hasNext()) {
          var campaign = campaignIterator.next();
          Logger.log(campaign.getName());
          
              // Grab the current daily budget
              var currentDailyBudget = campaign.getBudget().getAmount();
              Logger.log("currentDailyBudget: " + currentDailyBudget);
      }
      
    // Email function to pass string and send through to email provided
    // ============================= UPDATE EMAIL AND ACCOUNT SCRIPT WILL BE RUN ON =============
    // ============================== EXAMPLE BELOW =============================================
    function notify(string) {
      MailApp.sendEmail("eric.king@comporium.com", "Batesburg - 7/19/16-7/16/18", string);
    }
    // ==========================================================================================
    // ==========================================================================================
      
    // Calculating daily budget
    // Total ordered monthly impressions - current impressions = impressions remaining for the month
  
    // impressions remaining for the month / days remaining before end of the month = estimated daily impressions needed per day
  
    // estimated daily impressions needed per day * Avg CPM from last 7 days = new daily budget
    
    // =================== ENTER TOTAL MONTHLY IMPRESSIONS BASED ON ORDER  ======================
    // =================== CHANGE PLACEHOLDER NUMBER ============================================
                        var orderedImpressions = 30000;
    //===========================================================================================
    
    // Current Impressions at today's date
    var stats = currentAccount.getStatsFor("THIS_MONTH");
    var avgCpm = currentAccount.getStatsFor("LAST_7_DAYS");
    var currentImpressions = stats.getImpressions();
    var currentCpm = avgCpm.getAverageCpm();
    Logger.log("avg cpm - last 7 days: " + currentCpm);
    Logger.log("current campaign impressions: " + currentImpressions);
    
      // Date Calculation
      var _MS_PER_DAY = 1000 * 60 * 60 * 24;
      var today    = new Date();
      // ======================== ENTER END OF MONTH DATE FROM HERE ==========================================
      // ======================== MAKE SURE IT IS INSIDE "" =====================================
                            var dateFrom    = new Date("2017-11-30");
      // ========================================================================================
      // ========================================================================================
      var remainingDays    = dateDiffInDays(dateFrom, today);
      Logger.log("Days remaining: " + remainingDays);
      
      if (remainingDays > 0 ) { // Apply you login on remaining days
      }
      function dateDiffInDays(dateFrom, today) {
        // Discard the time and time-zone information.
        var utc1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        var utc2 = Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
      
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
      }
      
      // Calculate the number or impressions left
      var impressionsRemaining = orderedImpressions - currentImpressions;
      
      // Calculate the number of daily impressions
      var dailyImpressions = impressionsRemaining / remainingDays;
      Logger.log("calcualted daily Impressions: " + dailyImpressions);
      
      // Calculate the daily budget
      var dailyBudget = dailyImpressions / 1000 * currentCpm;
      Logger.log("calculated daily budget: " + dailyBudget);
  
  // This function is the one that might need some adjustment based on testing
  
    function adjustBudget(budgetToAdjust) {
      var currentCampaigns = AdWordsApp.campaigns().get();
      if(currentCampaigns.hasNext()) {
        // var campaignSelected = campaignIterator().next();
        var currentBudgetToAdjust = campaign.getBudget();
        Logger.log("current budget: " + currentBudgetToAdjust);
        var getAllBudgetToAdjust = currentBudgetToAdjust.campaigns().get();
        
        while (getAllBudgetToAdjust.hasNext()) {
          var allCampaignsCurrentBudgets = getAllBudgetToAdjust.next();
          allCampaignsCurrentBudgets.getBudget().setAmount(budgetToAdjust);
          Logger.log(allCampaignsCurrentBudgets.getName());
          //Logger.log(allCampaignsCurrentBudgets.getAmount());
        }
    }
    }
  
  
  //   Failsafe 1 - If campaign over delivered (If calculated impressions = negative)
  // If total current impressions > ordered impressions
  //               Set [new ordered impressions] to 50% of ordered impressions and adjust budget
  
  // Failsafe 2 - If daily budget is an error
  // Daily budget should never be $2
    
    // Conditional checks to track the budget flow
    if(currentDailyBudget === 0) {
      Logger.log("Budget is 0");
      // email notification - BUDGET HAS FALLEN TO 0!
      notify("Budget has depleted for this account - please take a look at the account.");
    }
    else if(dailyBudget < 0 && dailyBudget > 2) {
      Logger.log("Daily budget is outside of where we want it to be - " + dailyBudget);
      notify("Budget calculated incorrectly or has moved above $2");
    }
    else if(dailyImpressions < 0) {
      Logger.log("Daily Impressions have overdelivered");
      if(dailyImpressions > orderedImpressions) {
        Logger.log("Calculated daily impressions are over monthly total...");
        // email notification
        notify("Calculated daily impressions have exceeded the monthly total - please take a look at this account");
      }
    }
    else if(currentDailyBudget > dailyBudget) {
      Logger.log("Budget has increased over daily calculated budget - adjusting ...");
      adjustBudget(dailyBudget);
      //email notification - Budget adjusted over calculated daily budget for
      notify("Budget has increased over the daily calculated budget and has been adjusted for this account");
    } 
    else if(currentDailyBudget < dailyBudget) {
      Logger.log("Budget has decreased over daily calculated budget - adjusting ...");
      adjustBudget(dailyBudget);
      // email notification - Budget adjusted below the calculated daily budget for
      notify("Budget has decreased below the daily calculated budget and has been adjusted for this account.");
    }
    else {
      Logger.log("Budget is holding - no adjustment necessary")
    }
  }