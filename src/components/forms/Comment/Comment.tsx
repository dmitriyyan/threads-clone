'use client';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { addCommentToThread } from '@/lib/actions/thread.actions';
import { CommentValidation } from '@/lib/validations/thread';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

type Props = {
  readonly currentUserId: string;
  readonly currentUserImg: string;
  readonly threadId: string;
};

const Comment = ({ currentUserId, currentUserImg, threadId }: Props) => {
  const pathname = usePathname();

  const form = useForm<z.infer<typeof CommentValidation>>({
    defaultValues: {
      thread: '',
    },
    resolver: zodResolver(CommentValidation),
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname,
    );

    form.reset();
  };

  return (
    <Form {...form}>
      <form
        className="comment-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full items-center gap-3">
              <FormLabel>
                <Image
                  alt="current_user"
                  className="rounded-full object-cover"
                  height={48}
                  src={currentUserImg}
                  width={48}
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  type="text"
                  {...field}
                  className="no-focus text-light-1 outline-none"
                  placeholder="Comment..."
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          className="comment-form_btn"
          type="submit"
        >
          Reply
        </Button>
      </form>
    </Form>
  );
};

export default Comment;
