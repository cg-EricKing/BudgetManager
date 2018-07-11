// Script to set campaign budget to .50 if the campaign is over-delivering
    // Apply this script to any accounts that have a running campaign
    // The script will just watch the impressions and send a notification upon reaching the goal

// Main function
function main() {
    // Init Spreadsheet
    // Create cell for ordered impressions
    // Grab that data and save it - Make sure the url is for the correct SS
    var spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1hRVG4pQLyjD9c1af6xxoZEQayCKQYJjGzdw6My7RbMs/edit?usp=sharing");
    var sheet = spreadsheet.getSheets()[15]; // Set correct sheet number in budget spreadsheet

    var orderedImpressions = sheet.getRange(2,3).getValue();
    

    // Init globals 
    var emailForNotify = "eric.king@comporium.com";


    // Select Account with condition enabled
    var currentAccount = AdWordsApp.currentAccount();
    var accountName = currentAccount.getName();
    Logger.log("Processing on the following account: " + accountName);
    Logger.log("Ordered Impressions: " + orderedImpressions);


    // Select Campaign with condition enabled
    // With condition impressions > 0 to make sure it is running
    var campaignSelector = AdWordsApp
        .campaigns()
        .withCondition("CampaignStatus = ENABLED")
        .withCondition("LabelNames = 'Pacing'");

    var campaignIterator = campaignSelector.get();

    while (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        var campaignName = campaign.getName();
        Logger.log("Campaign Name: " + campaignName);
        var currentDailyBudget = campaign.getBudget().getAmount();
        Logger.log("current daily budget: " + currentDailyBudget);
        var stats = campaign.getStatsFor("ALL_TIME");
        // Get the impression stats for the running campaign - ALL_TIME
        var impressions = stats.getImpressions();
      	Logger.log("Impressions: " + impressions);
        // Write a conditional check to see if the campaign has reached it's goal.
        if(impressions > orderedImpressions) {
            Logger.log(CampaignName + " This campaign is now over-delivering, please adjust the budget down.");
            notify(CampaignName + " This campaign is now over-delivering, please adjust the budget down.");
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