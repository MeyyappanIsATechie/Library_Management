'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { z, ZodType } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { FIELD_NAMES, FIELD_TYPES } from '@/constants';
import FileUpload from './FileUpload';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Props<T extends FieldValues> {
  type: 'SIGN_UP' | 'SIGN_IN';
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const isSignIn = type === 'SIGN_IN';

  // 1. Define your form.
  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });
  // 2. Define a submit handler.
  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      const { success, error } = await onSubmit(data);
      if (success) {
        toast({
          title: 'Success',
          description: !isSignIn
            ? 'Your account has been created successfully.'
            : 'Your account has been logged in successfully.',
        });
        router.push('/');
        // form.reset();
      } else {
        toast({
          title: `Error ${isSignIn ? 'signing in' : 'signing up'}`,
          description: error || 'An error occurred during form submission.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      // Handle form submission errors.
      console.error('Error submitting form:', error.message);
      toast({
        title: `Error ${isSignIn ? 'signing in' : 'signing up'}`,
        description: 'An error occurred during form submission.',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? 'Welcome Back to BookTard' : 'Create your library account'}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? 'Access the vast collection of resources, and stay updated'
          : 'Please complete all fields and upload a valid university ID to gain access to the library'}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 w-full"
        >
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                  </FormLabel>
                  <FormControl>
                    {field.name === 'universityCard' ? (
                      <FileUpload
                        type="image"
                        accept="image/*"
                        placeholder="Upload your ID"
                        folder="ids"
                        variant="dark"
                        onFileChange={field.onChange}
                      />
                    ) : (
                      <Input
                        required
                        type={
                          FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]
                        }
                        {...field}
                        className="form-input"
                      />
                    )}
                  </FormControl>
                  {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button className="form-btn" type="submit">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "Don't have an account? " : 'Already have an account? '}
        <Link
          className="font-bold text-primary"
          href={isSignIn ? '/sign-up' : '/sign-in'}
        >
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
