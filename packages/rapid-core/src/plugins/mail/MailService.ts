import { IRpdServer } from "~/core/server";
import { RpdMailSmtpServer, SendMailOptions } from "./MailPluginTypes";
import { RouteContext } from "~/core/routeContext";
import nodemailer from "nodemailer";

export default class MailService {
  #server: IRpdServer;
  #smtpServer: RpdMailSmtpServer;

  constructor(server: IRpdServer, smtpServer: RpdMailSmtpServer) {
    this.#server = server;
    this.#smtpServer = smtpServer;
  }

  async sendMail(routeContext: RouteContext, server: IRpdServer, options: SendMailOptions): Promise<any> {
    const smtpServer = this.#smtpServer;

    const transporter = nodemailer.createTransport({
      host: smtpServer.host,
      port: smtpServer.port,
      secure: smtpServer.secure, // true for port 465, false for other ports
      auth: {
        user: smtpServer.username,
        pass: smtpServer.password,
      },
    });

    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return info;
  }
}
