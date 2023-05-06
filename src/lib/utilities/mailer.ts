import nodemailer from "nodemailer";
import { env } from "$env/dynamic/private";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD
  }
});
