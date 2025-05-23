import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.sendgrid.net
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // upgrade later with STARTTLS; set to true if using port 465
  auth: {
    user: process.env.EMAIL_USER, // "apikey" for SendGrid
    pass: process.env.EMAIL_PASS, // your SendGrid API key
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      partialsDir: path.resolve("./src/sendEmail/templates"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/sendEmail/templates"),
    extName: ".hbs",
  }),
);

export const sendVerificationEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: `"NoReply" <${process.env.EMAIL_FROM}>`, // use your verified from email
    to,
    subject: "Email Verification",
    template: "/html", // Adjust based on your template structure
    context: {
      code,
    },
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};
