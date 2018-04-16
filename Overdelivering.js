// Script to set campaign budget to .50 if the campaign is over-delivering
    // Apply this script to any accounts that are Max Clicks - VCPM accounts have full pacing script

// Main function
function main() {
    // Set up SS
        // Init Spreadsheet
    // Create cell for ordered impressions
    // Grab that data and save it - Make sure the url is for the correct SS
    var spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1psxrVyBP8s90FCoxVnLO-shkrCoKzTRXzjb0c-0377Q/edit?usp=sharing");
    var sheet = spreadsheet.getSheets()[0]; // Set correct sheet number in budget spreadsheet

    // Init globals (ordered impressions, budget adjustment value) *** Set correct ranges for budget script
    var emailForNotify = sheet.getRange(2,2).getValue();
    var orderedImpressions = sheet.getRange(2,1).getValue();
    Logger.log("Ordered Impressions from SS: " + orderedImpressions);
    var setTo = .50;

    // Select Account with condition enabled
    var currentAccount = AdWordsApp.currentAccount();
    var accountName = currentAccount.getName();
    Logger.log("Processing on the following account: " + accountName);

    // This function takes a campaign budget - logs the current budget and sets the new amount of the given budget parameter

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

    // Select Campaign with condition enabled
    // With condition impressions > 0 to make sure it is running
    var campaignSelector = AdWordsApp
        .campaigns()
        .withCondition("CampaignStatus = ENABLED")
        .withCondition("Impressions > 0")
        .forDateRange("LAST_7_DAYS");

    var campaignIterator = campaignSelector.get();

    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        var campaignName = campaign.getName();
        var currentDailyBudget = campaign.getBudget().getAmount();
        Logger.log("current daily budget: " + currentDailyBudget);
        var stats = campaign.getStatsFor("ALL_TIME");
        // Get the impression stats for the running campaign - ALL_TIME
        var impressions = stats.getImpressions();
      	Logger.log("Impressions: " + impressions);
        // Write a conditional check to set the daily budget to .50 if over-delivering
        if(impressions > orderedImpressions) {
            Logger.log("Campaign is over-delivering - budget set to .50");
            adjustBudget(setTo);
            notify("The campaign is over-delivering and the budget has been adjusted down to .50 - please check into this campaign.")
        } else {
           Logger.log("Campaign is pacing below ordered impressions"); 
        }
    }

    // Email function to pass string and send through to email provided
    function notify(string) {
        // Construct email template for notifications
        // Must have to, subject, htmlBody
        var emailTemplate = {
            to: emailForNotify,
            subject: accountName,
            htmlBody: "<h1>Comporium Media Services Automation Scripts</h1>" + "<br>" + "<p>This account has encountered an issue</p>" + accountName +
            "<br>" + "<p>The issue is with this campaign: </p>" + campaignName + "<br>" + "<p>This is what is wrong - </p>" + "<br>"
            + string + "<br>" +"<p>If something is incorrect with this notification please reply to this email. Thanks!</p>"
        }
            MailApp.sendEmail(emailTemplate);
        }

}