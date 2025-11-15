import { createTransport} from "nodemailer"
const mailSender = async(email,title,body)=>{
    try {
        const transporter = createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })
        
    
        const info = await transporter.sendMail({
            from:"noreply flostat team ",
            to:`${email}`,
            bcc:process.env.MAIL_USER, 
            subject:`${title}`,
            html:`${body}`
        })
        // console.log("INfo ",info)
        return info;
    } catch (error) {
        console.log("Error on MailSender : ",error);
        throw error;
    }
}

export default mailSender;