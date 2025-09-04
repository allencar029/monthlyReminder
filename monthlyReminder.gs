const FAILURE_NOTIFY = "FAILUREEMAIL@gmail.com"
const RECIPIENT = "RECIPIENT@gmail.com"
const PDF_ID = "pdfId"
const SP = PropertiesService.getScriptProperties()
const TZ = Session.getScriptTimeZone()
const alertTime = 10

function sendReminder() {
    const subject = "Reminder: Water Bill"
    const body = "Below is your monthly Water Bill. Please pay via Venmo to @venmo-recipient within 30 days."
    const html = `
        <p>Below is your monthly Water Bill. Please pay via Venmo to @venmo-recipient within 30 days.</p>
        <p>Thank you</p>
        `

    sendEmail(RECIPIENT, subject, body, html)
}

function sendEmail(recipient, subject, body, html){

    const pdfId = PDF_ID

    let pdfBlob

    try {
        pdfBlob = DriveApp.getFileById(pdfId).getBlob().setName("Water_Bill_Invoice.pdf")
    } catch (err) {
        const msg = `Asset fetch failed: ${err && err.message}`
        Logger.log(msg)
        try { GmailApp.sendEmail(FAILURE_NOTIFY, "Water Bill Reminder FAILED (assets)", msg) 
        } catch (_) {}
    throw err
    }

    const opts = {
        htmlBody: html,
        attachments: [pdfBlob],
        replyTo: "scott@colemererealty.com"
    }

    try {
        GmailApp.sendEmail(recipient, subject, body, opts);
        Logger.log(`Sent email to ${recipient} at ${new Date()}`)
    } catch (err) {
        const msg = `Email send failed: ${err && err.message}`
        Logger.log(msg)
        try { GmailApp.sendEmail(FAILURE_NOTIFY, "Water Bill Reminder FAILED (send)", msg)} catch (_) {}
        throw err
    }
}

function monthlyReminder(){
    try {
        const now = new Date()
        const day = now.getDate()
        Logger.log(`monthlyReminder started at ${day}`)

        const todayKey = Utilities.formatDate(now, TZ, 'yyyy-MM-dd')
        const lastSent = SP.getProperty('LAST_SENT_DATE');
        if (lastSent === todayKey) {
            Logger.log(`Already sent today (${todayKey}); skipping.`)
            return
        }

        if (day === 1 || day === 15) {
            sendReminder()
            SP.setProperty('LAST_SENT_DATE', todayKey)
        } else {
            return
        }
    } catch (err) {
        const msg = `monthlyReminder runtime error: ${err && err.message}`
        Logger.log(msg);
        try { GmailApp.sendEmail(FAILURE_NOTIFY, "Runtime error for monthlyReminder", msg)} catch (_) {}
        throw err
    }
}

function createDailyTrigger() {
    ScriptApp.getProjectTriggers()
        .filter(t => t.getHandlerFunction() === "monthlyReminder")
        .forEach(t => ScriptApp.deleteTrigger(t))

    ScriptApp.newTrigger("monthlyReminder")
        .timeBased()
        .atHour(alertTime)
        .nearMinute(0)
        .everyDays(1)
        .create()

    Logger.log(`Installed daily trigger for monthlyReminder to occur the first and fifteenth of every month at ${alertTime} local time.`)
}