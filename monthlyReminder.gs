const FAILURE_NOTIFY = "FAILUREEMAIL@gmail.com"
const RECIPIENT = "RECEPIENT@gmail.com"
const IMAGE_ID = "imageId"
const PDF_ID = "pdfId"

function sendReminder() {
    const subject = "Reminder: Water Bill"
    const body = "Below is your monthly Water Bill. Please pay via Venmo to @venmo-recepient within 30 days."
    const html = `
        <p>Below is your monthly Water Bill. Please pay via Venmo to @venmo-recepient within 30 days.</p>
        <p>Thank you</p>
        <p><img src="cid:logo" alt="Logo"></p>
        `

    sendEmail(RECIPIENT, subject, body, html)
}

function sendEmail(recipient, subject, body, html){

    const pdfId = PDF_ID
    const imageId = IMAGE_ID

    let pdfBlob, imageBlob

    try {
        pdfBlob = DriveApp.getFileById(pdfId).getBlob().setName("Water_Bill_Invoice.pdf")
        imageBlob = DriveApp.getFileById(imageId).getBlob()
    } catch (err) {
        const msg = `Asset fetch failed: ${err && err.message}`
        Logger.log(msg)
        try { GmailApp.sendEmail(FAILURE_NOTIFY, "Rent Reminder FAILED (assets)", msg) 
        } catch (_) {}
    throw err
    }

    const opts = {
        htmlBody: html,
        attachments: [pdfBlob],
        inlineImages: {
        logo: imageBlob
        }
    }

    try {
        GmailApp.sendEmail(recipient, subject, body, opts);
        Logger.log(`Sent email to ${recipient} at ${new Date()}`)
    } catch (err) {
        const msg = `Email send failed: ${err && err.message}`
        Logger.log(msg)
        throw err
    }
}

function monthlyReminder(){
        const day = new Date().getDate()
    Logger.log(`monthlyReminder started at ${day}`)

    if (day === 1 || day === 15) {
        sendReminder()
    } else {
        return
    }
}

const alertTime = 10

function createDailyTrigger() {
    ScriptApp.getProjectTriggers()
        .filter(t => t.getHandlerFunction() === "monthlyReminder")
        .forEach(t => ScriptApp.deleteTrigger(t))

    ScriptApp.newTrigger("monthlyReminder")
        .timeBased()
        .atHour(alertTime)
        .everyDays(1)
        .create()

    Logger.log(`Installed daily trigger for monthlyReminder to occur the first and fifteenth of every month at ${alertTime} local time.`)
}