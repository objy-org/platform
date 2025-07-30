
import { MailService } from "@sendgrid/mail";

const sgMail = new MailService();

export default function SendgridMapper() {

    this.connect = function(key) {
        sgMail.setApiKey(key);
        return this;
    }

    this.send = function(from, to, subject, body) {
        console.log(arguments)
        var msg = {
            to: to,
            from: from,
            subject: subject,
            html: body
        };
        sgMail.send(msg);
    }

}
