import { SmtpClient } from "smtp";
import {
  host,
  password,
  port,
  username,
} from "../../config/services/smtp.js";

export const sendNewEmail = async (
  recipient,
  subject,
  content,
) => {
  const client = new SmtpClient({
    content_encoding: "7bit",
  });

  await client.connectTLS({
    hostname: host,
    port,
    username,
    password,
  });

  await client.send({
    from: username,
    to: recipient,
    subject,
    content,
  });

  await client.close();
};
