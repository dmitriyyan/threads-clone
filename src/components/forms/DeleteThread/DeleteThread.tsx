'use client';

import { deleteThread } from '@/lib/actions/thread.actions';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
  readonly authorId: string;
  readonly currentUserId: string;
  readonly isComment?: boolean;
  readonly parentId: string | undefined;
  readonly threadId: string;
};

const DeleteThread = ({
  authorId,
  currentUserId,
  isComment,
  parentId,
  threadId,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId || pathname === '/') return null;

  return (
    <Image
      alt="delete"
      className="cursor-pointer object-contain"
      height={18}
      onClick={async () => {
        await deleteThread(JSON.parse(threadId), pathname);
        if (!parentId || !isComment) {
          router.push('/');
        }
      }}
      src="/assets/delete.svg"
      width={18}
    />
  );
};

export default DeleteThread;
