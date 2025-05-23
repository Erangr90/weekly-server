"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST, // smtp.sendgrid.net
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // upgrade later with STARTTLS; set to true if using port 465
    auth: {
        user: process.env.EMAIL_USER, // "apikey" for SendGrid
        pass: process.env.EMAIL_PASS, // your SendGrid API key
    },
});
transporter.use("compile", (0, nodemailer_express_handlebars_1.default)({
    viewEngine: {
        partialsDir: path_1.default.resolve("./src/sendEmail/templates"),
        defaultLayout: false,
    },
    viewPath: path_1.default.resolve("./src/sendEmail/templates"),
    extName: ".hbs",
}));
const sendVerificationEmail = (to, code) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
