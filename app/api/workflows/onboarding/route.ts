import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { serve } from '@upstash/workflow/nextjs';
import { eq } from 'drizzle-orm';
import emailjs from 'emailjs-com';

type InitialData = {
  email: string;
  fullName: string;
};

type UserState = 'non-active' | 'active';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return 'non-active';
  }
  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const currentTime = new Date();
  const timeDiff = currentTime.getTime() - lastActivityDate.getTime();
  if (timeDiff > THREE_DAYS_IN_MS && timeDiff <= THIRTY_DAYS_IN_MS) {
    return 'non-active';
  }
  return 'active';
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  await context.run('new-signup', async () => {
    await sendEmail({
      email,
      subject: 'Welcome To BookTard',
      message: `Welcome ${fullName}`,
    });
  });

  await context.sleep('wait-for-3-days', 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run('check-user-state', async () => {
      return await getUserState(email);
    });

    if (state === 'non-active') {
      await context.run('send-email-non-active', async () => {
        await sendEmail({
          email,
          subject: 'Are you still there?',
          message: `Hey ${fullName}, we miss you on here!`,
        });
      });
    } else if (state === 'active') {
      await context.run('send-email-active', async () => {
        // await sendNewsletter(email);
        await sendEmail({
          email,
          subject: 'Welcome back!',
          message: `Welcome back ${fullName}!`,
        });
      });
    }

    await context.sleep('wait-for-1-month', 60 * 60 * 24 * 30);
  }
});

async function sendEmail({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) {
  // Implement email sending logic here
  try {
    const result = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID, // Service ID from EmailJS
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, // Template ID from EmailJS
      { email, subject, message }, // Data to pass into template
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY // Public Key from EmailJS
    );
    console.log(`Email sent: ${result.status}`);
  } catch (error) {
    console.error(`Failed to send email: ${error}`);
  }
  console.log(`Sending ${message} email to ${email}`);
}

async function sendNewsletter(email: string) {
  const newsletterContent =
    'Here is our latest newsletter with updates and news!';
  console.log(`Sending newsletter to ${email}: ${newsletterContent}`);
}
