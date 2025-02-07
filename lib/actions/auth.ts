'use server';

import { signIn } from '@/auth';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import ratelimit from '../ratelimit';
import { redirect } from 'next/navigation';
import { workflowClient } from '../workflow';
import config from '../config';

const signInWithCredentials = async (
  params: Pick<AuthCredentials, 'email' | 'password'>
) => {
  const { email, password } = params;

  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return redirect('/too-fast');
  }

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true, user: result.user };
  } catch (error) {
    console.log(error, 'Sign In Error');
    return { success: false, error: 'Sign In failed' };
  }
};

const signUp = async (params: AuthCredentials) => {
  const { fullName, email, universityId, password, universityCard } = params;

  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return redirect('/too-fast');
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: 'User already exists' };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    // await workflowClient.trigger({
    //   url: `${config.env.prodApiEndpoint}/api/workflow/onboarding`,
    //   body: {
    //     email,
    //     fullName,
    //   },
    // });

    // const response = await fetch(
    //   `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       email,
    //       fullName,
    //     }),
    //   }
    // );

    // if (!response.ok) {
    //   console.error('Failed to trigger workflow');
    //   throw new Error('Workflow trigger failed');
    // }

    await signInWithCredentials({ email, password });
    return { success: true };
  } catch (error) {
    console.log(error, 'Signup Error');
    return { success: false, error: 'Signup failed' };
  }
};

export { signInWithCredentials, signUp };
