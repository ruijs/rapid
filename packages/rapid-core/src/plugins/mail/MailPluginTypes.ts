export type MailPluginConfig = {
  smtpServer: RpdMailSmtpServer;
};

export type RpdMailSmtpServer = {
  host: string;
  port: number;
  secure: boolean; // true for port 465, false for other ports (normally 587).
  username: string;
  password: string;
};

export type RpdMail = {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};

export type SendMailOptions = {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};
