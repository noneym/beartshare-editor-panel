import xml2js from "xml2js";

const SMS_USERNAME = process.env.SMS_USERNAME || "";
const SMS_PASSWORD = process.env.SMS_PASSWORD || "";
const SMS_HEADER = process.env.SMS_HEADER || "BEARTSHARE";

export interface SendSMSOptions {
  message: string;
  recipients: string[];
  header?: string;
}

export async function sendSMS(options: SendSMSOptions): Promise<string> {
  const { message, recipients, header = SMS_HEADER } = options;

  const gsmNumbers = recipients.join("</gsm><gsm>");

  const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SOAP-ENV:Body>
    <ns3:smsGonder1NV2 xmlns:ns3="http://sms/">
      <username>${SMS_USERNAME}</username>
      <password>${SMS_PASSWORD}</password>
      <header>${header}</header>
      <msg>${message}</msg>
      <gsm>${gsmNumbers}</gsm>
      <filter>0</filter>
      <encoding>TR</encoding>
    </ns3:smsGonder1NV2>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

  const response = await fetch("http://soap.netgsm.com.tr:8080/Sms_webservis/SMS?wsdl/", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
    },
    body: soapBody,
  });

  const responseText = await response.text();
  console.log("NetGSM Response:", responseText);
  
  // Parse the response to check for errors
  try {
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(responseText);
    console.log("NetGSM Parsed Response:", JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.error("Failed to parse NetGSM response:", err);
  }
  
  return responseText;
}

export function cleanPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  // If it starts with 90, keep it; otherwise add 90
  if (cleaned.startsWith("90")) {
    return cleaned;
  }
  return "90" + cleaned;
}
