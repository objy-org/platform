
import { MailService } from "@sendgrid/mail";

const sgMail = new MailService();

export default function SendgridMapper() {
    this.connect = function(key) {
        sgMail.setApiKey(key);
        return this;
    }

    this.send = async function(from, to, subject, body) {
        var msg = {
            to: to,
            from: from,
            subject: subject,
            html: body
        };

        try {
            await sgMail.send(msg);
        } catch(err){
            throw err
        }
        
    }

}
