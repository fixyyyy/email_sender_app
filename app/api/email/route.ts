import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server, options } = body;

    if (server.type === 'sendgrid') {
      if (!server.apiKey) {
        throw new Error('SendGrid API key is required');
      }
      
      sgMail.setApiKey(server.apiKey);
      
      const msg = {
        to: options.to,
        from: {
          email: options.from,
          name: options.senderName,
        },
        subject: options.subject,
        html: options.content,
      };

      await sgMail.send(msg);
    } else {
      if (!server.host || !server.port) {
        throw new Error('SMTP host and port are required');
      }

      const transporter = nodemailer.createTransport({
        host: server.host,
        port: parseInt(server.port),
        secure: server.port === '465',
        auth: server.isRootServer ? undefined : {
          user: server.username,
          pass: server.password,
        },
      });

      await transporter.sendMail({
        from: `"${options.senderName}" <${options.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.content,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}