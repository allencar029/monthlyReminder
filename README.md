# Google Apps Script – Monthly Reminder

This Apps Script sends a monthly water bill reminder email with:
- A PDF invoice attached (from Google Drive)
- An inline logo
- Both plain text and HTML body

## Setup
1. Create a new Google Apps Script project
2. Copy code from `monthlyReminder.gs`
3. Replace placeholder values:
   - `FAILURE_NOTIFY` -> email of the person who you want to be notified when the script fails
   - `RECIPIENT` -> recipient email
   - `FOLDER_ID` -> Drive folder ID of invoice PDF
4. Set up a time-driven trigger in Apps Script to run `monthlyReminder` monthly
