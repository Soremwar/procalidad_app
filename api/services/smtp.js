import { SmtpClient } from "smtp";
import { host, password, port, username } from "../../config/services/smtp.js";

export const sendNewEmail = async (
  recipient,
  subject,
  html_content,
  text_content = "",
) => {
  const client = new SmtpClient;

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
    content: text_content,
    html: html_content,
  });

  await client.close();
};
