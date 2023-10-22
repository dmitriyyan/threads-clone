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
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { updateUser } from '@/lib/actions/user.actions';
import { useUploadThing } from '@/lib/uploadthing';
import { isBaseImage } from '@/lib/utils';
import { UserValidation } from '@/lib/validations/user';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { type ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';

type Props = {
  readonly btnTitle: string;
  readonly user: {
    bio: string;
    id: string;
    image: string;
    name: string;
    objectId: string;
    username: string;
  };
};

const AccountProfile = ({ btnTitle, user }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { startUpload } = useUploadThing('media');

  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof UserValidation>>({
    defaultValues: {
      bio: user?.bio ? user.bio : '',
      name: user?.name ? user.name : '',
      profile_photo: user?.image ? user.image : '',
      username: user?.username ? user.username : '',
    },
    resolver: zodResolver(UserValidation),
  });

  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo;

    const hasImageChanged = isBaseImage(blob);
    let profilePhoto = values.profile_photo;
    if (hasImageChanged) {
      const imgResponse = await startUpload(files);

      if (imgResponse && imgResponse[0].fileUrl) {
        profilePhoto = imgResponse[0].fileUrl;
      }
    }

    await updateUser({
      bio: values.bio,
      image: profilePhoto,
      name: values.name,
      path: pathname,
      userId: user.id,
      username: values.username,
    });

    if (pathname === '/profile/edit') {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleImage = (
    changeEvent: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void,
  ) => {
    changeEvent.preventDefault();

    const fileReader = new FileReader();

    if (changeEvent.target.files && changeEvent.target.files.length > 0) {
      const file = changeEvent.target.files[0];
      setFiles(Array.from(changeEvent.target.files));

      if (!file.type.includes('image')) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || '';
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                  <Image
                    alt="profile_icon"
                    className="rounded-full object-contain"
                    height={96}
                    priority
                    src={field.value}
                    width={96}
                  />
                ) : (
                  <Image
                    alt="profile_icon"
                    className="object-contain"
                    height={24}
                    src="/assets/profile.svg"
                    width={24}
                  />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  accept="image/*"
                  className="account-form_image-input"
                  onChange={(event) => handleImage(event, field.onChange)}
                  placeholder="Add profile photo"
                  type="file"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  className="account-form_input no-focus"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  className="account-form_input no-focus"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  className="account-form_input no-focus"
                  rows={10}
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
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default AccountProfile;
