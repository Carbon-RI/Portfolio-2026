import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAdminDb } from "@/lib/firebase/admin";
import { FB_COLLECTIONS, FB_DOCS } from "@/lib/constants";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const profileDoc = await getAdminDb()
      .collection(FB_COLLECTIONS.SETTINGS)
      .doc(FB_DOCS.PROFILE)
      .get();

    const profile = profileDoc.data();
    const targetEmail =
      profile?.emailAddress ||
      process.env.CONTACT_EMAIL ||
      process.env.EMAIL_USER;

    const mailOptions = {
      to: targetEmail,
      from: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #262626; padding: 20px; border-radius: 4px; background-color: #ffffff; color: #171717;">
          <h2 style="color: #0a0a0a; border-bottom: 2px solid #262626; padding-bottom: 10px; font-size: 18px; text-transform: uppercase; letter-spacing: 0.2em;">New Contact Submission</h2>
          <p style="margin: 15px 0;"><strong style="color: #171717;">Name:</strong> ${name}</p>
          <p style="margin: 15px 0;"><strong style="color: #171717;">Email:</strong> ${email}</p>
          <p style="margin-top: 25px; margin-bottom: 10px;"><strong style="color: #171717;">Message:</strong></p>
          <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #0a0a0a; white-space: pre-wrap; line-height: 1.6; color: #262626;">${message}</div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #737373; text-align: center; letter-spacing: 0.1em;">SENT VIA PORTFOLIO ADMIN SYSTEM</div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
