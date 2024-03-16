require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const compression = require("compression");
const Joi = require("joi");

app.use(express.json({ limit: "200mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", 1728000);
  res.setHeader("Access-Control-Expose-Headers", "*");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(compression());

const inputValidation = Joi.object({
  name: Joi.string().required().min(2).label("name"),
  email: Joi.string().email().required().label("email"),
  phone: Joi.string().alphanum().required().label("phone"),
  company: Joi.string().optional().allow("", null).label("company"),
  message: Joi.string().optional().allow("", null).label("message"),
});
app.get("*", (_, res) => res.status(200).json({ message: "Active" }));
// Define Routes...
app.post("/contact-me", async (req, res, next) => {
  let { error } = inputValidation.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error: " + error.details[0].message });
  }
  const { name, email, phone, company, message } = req.body;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  let mailOptions = {
    from: process.env.EMAIL,
    to: "riadhossain7464@gmail.com",
    subject: "Reqruitement/Projeect request",
    text: `
    Potential Project/Request.\n
    Name: ${name}\n
    Email: ${email}\n
    Phone: ${phone}\n
    company: ${company || "Not specified"}\n
    Message: ${message || "No message"}
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("email send successfully.");
    res.status(200).json({
      message: "I have recieved your email. I'll get in touch shortly.",
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Eamil could not be sent. " + (err, message || "") });
  }
});

async function startServer() {
  const PORT = process.env.PORT || 8000;
  const httpServer = app.listen(PORT, () =>
    console.log(`Server ${process.pid} started @ port ${PORT}`)
  );
}
(async () => {
  startServer();
})();
