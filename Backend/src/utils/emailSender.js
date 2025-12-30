import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const mailSender = async (option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Coding Lab",
      link: "https://www.tasincoder.com",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  var email = {
    body: {
      name: option.name,
      intro: "Welcome to Coding Lab! We're very excited to have you on board.",
      action: {
        instructions:
          option.instructions ||
          "To get verified with Coding Lab, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: option.subject,
          link: option.link,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  // Generate an HTML email with the provided contents
  const emailBody = mailGenerator.generate(email);

  const emailText = mailGenerator.generatePlaintext(email);

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: option.email,
    subject: option.subject,
    text: emailText,
    html: emailBody,
  });

  console.log(" Preview URL: %s", info.response);
};

export default mailSender;

// const option = {
//   name: "",
//   email: "",
//   subject: "",
//   instructions: "",
//   link: "",
// };
