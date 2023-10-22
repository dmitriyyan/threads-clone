'use client';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Textarea } from '@/components/ui/Textarea';
import { createThread } from '@/lib/actions/thread.actions';
import { ThreadValidation } from '@/lib/validations/thread';
import { useOrganization } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';

type Props = {
  readonly userId: string;
};

const PostThread = ({ userId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const { organization } = useOrganization();

  const form = useForm<z.infer<typeof ThreadValidation>>({
    defaultValues: {
      accountId: userId,
      thread: '',
    },
    resolver: zodResolver(ThreadValidation),
  });

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    await createThread({
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
      text: values.thread,
    });

    router.push('/');
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                  rows={15}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="bg-primary-500"
          type="submit"
        >
          Post Thread
        </Button>
      </form>
    </Form>
  );
};

export default PostThread;
