function main() {
  // select current account - get account name and return it
  var currentAccount = AdWordsApp.currentAccount();
  var accountName = currentAccount.getName();
  Logger.log(accountName);
  var emailForNotify = 'eric.king@comporium.com';
  // Enter impression goal here
  var orderedImpressions = 0;

  var today = new Date();
  // Enter end date here (Year, Month, Day -  YYYY-MM-DD)
  var endDate = new Date('2020-04-01');

  var maxBudget = 55;
  var minBudget = .5;


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

  /**
   * Returns the number of days between two dates.
   *
   * @param {Object} from The older Date object.
   * @param {Object} to The newer (more recent) Date object.
   * @return {number} The number of days between the given dates (possibly
   *     fractional).
   */
  function dayDifference(from, to) {
    return (to.getTime() - from.getTime()) / (24 * 3600 * 1000);
  }


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


      var avgCpm = campaign.getStatsFor("LAST_7_DAYS");
      var currentCpm = avgCpm.getAverageCpm();
      Logger.log("Avg CPM for last 7 days - " + currentCpm);

      var allStats = campaign.getStatsFor("ALL_TIME");
      var allImpressions = allStats.getImpressions();
      Logger.log("Current Impression Total - " + allImpressions);

      var newDaysRemaining = dayDifference(today, endDate);
      newDaysRemaining = parseInt(newDaysRemaining);
      newDaysRemaining = newDaysRemaining + 1;
      Logger.log("New Days Remaining: " + newDaysRemaining);

      var impressionsRemaining = orderedImpressions - allImpressions;
      Logger.log("Impressions Remaining - " + impressionsRemaining);

      var dailyImpressions = impressionsRemaining / newDaysRemaining;
	  Logger.log("Daily Impressions Calculated - " + dailyImpressions);
      var dailyBudget = dailyImpressions / 1000 * currentCpm;
      dailyBudget.toFixed(2);
      Logger.log("Calculated Daily Budget - " + dailyBudget);


      if(currentDailyBudget === 0) {
        Logger.log("Budget is 0");
        notify("Budget has depleted for this account - please take a look at the account.");
      }
      else if (currentBiddingStrategy != "MANUAL_CPM") {
        Logger.log("Not a correct bidding strategy for this script - please use the correct script");
        notify("Not a correct bidding strategy for this script - please use the correct script");
      }
      else if(currentCpm <= 0) {
        Logger.log("CPM Calculated at or below 0 - Please look into this campaign");
        notify("CPM Calculated at or below 0 - Please look into this campaign");
      }
      else if(dailyBudget < 0) {
        Logger.log("Daily budget is outside of where we want it to be - may be a negative number " + dailyBudget);
        notify("Budget calculated incorrectly or this account is overdelivering!");
      }
      else if(dailyImpressions < 0) {
        Logger.log("Daily Impressions have overdelivered");
        notify("Daily impression calculations indicates campaign is overdelivering");
      }
      else if(allImpressions > orderedImpressions) {
        Logger.log("Calculated daily impressions are over impression goal...");
        notify("All time impressions have exceeded the overall goal - budget adjusted to .50");
        adjustBudget(minBudget);
      }
      else if (dailyBudget > maxBudget) {
        Logger.log("Budget has calculated over an amount of $25 - adjusting to max budget amount of $20");
        notify("Daily budget calculated over $25 max budget - budget adjusted to $20, please double check to see if this is correct");
        adjustBudget(maxBudget);
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


}