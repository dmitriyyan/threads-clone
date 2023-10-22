import { DeleteThread } from '@/components/forms/DeleteThread';
import { formatDateString } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  readonly author: {
    id: string;
    image?: string;
    name: string;
  };
  readonly comments: Array<{
    author: {
      image?: string;
    };
    id: string;
  }>;
  readonly community?: {
    id: string;
    image?: string;
    name: string;
  };
  readonly content: string;
  readonly createdAt: string;
  readonly currentUserId: string;
  readonly id: string;
  readonly isComment?: boolean;
  readonly parentId: string | undefined;
};

const ThreadCard = ({
  author,
  comments,
  community,
  content,
  createdAt,
  currentUserId,
  id,
  isComment,
  parentId,
}: Props) => {
  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? 'px-0 xs:px-7' : 'bg-dark-2 p-7'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link
              className="relative h-11 w-11"
              href={`/profile/${author.id}`}
            >
              <Image
                alt="user_community_image"
                className="cursor-pointer rounded-full"
                fill
                src={author.image || ''}
              />
            </Link>

            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link
              className="w-fit"
              href={`/profile/${author.id}`}
            >
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            <div className={`${isComment && 'mb-10'} mt-5 flex flex-col gap-3`}>
              <div className="flex gap-3.5">
                <Image
                  alt="heart"
                  className="cursor-pointer object-contain"
                  height={24}
                  src="/assets/heart-gray.svg"
                  width={24}
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    alt="heart"
                    className="cursor-pointer object-contain"
                    height={24}
                    src="/assets/reply.svg"
                    width={24}
                  />
                </Link>
                <Image
                  alt="heart"
                  className="cursor-pointer object-contain"
                  height={24}
                  src="/assets/repost.svg"
                  width={24}
                />
                <Image
                  alt="heart"
                  className="cursor-pointer object-contain"
                  height={24}
                  src="/assets/share.svg"
                  width={24}
                />
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length} repl{comments.length > 1 ? 'ies' : 'y'}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>

        <DeleteThread
          authorId={author.id}
          currentUserId={currentUserId}
          isComment={isComment}
          parentId={parentId}
          threadId={JSON.stringify(id)}
        />
      </div>

      {!isComment && comments.length > 0 && (
        <div className="ml-1 mt-3 flex items-center gap-2">
          {comments.slice(0, 2).map((comment, index) => (
            <Image
              alt={`user_${comment.id}`}
              className={`${index !== 0 && '-ml-5'} rounded-full object-cover`}
              height={24}
              key={comment.id}
              src={comment.author.image || ''}
              width={24}
            />
          ))}

          <Link href={`/thread/${id}`}>
            <p className="mt-1 text-subtle-medium text-gray-1">
              {comments.length} repl{comments.length > 1 ? 'ies' : 'y'}
            </p>
          </Link>
        </div>
      )}

      {!isComment && community && (
        <Link
          className="mt-5 flex items-center"
          href={`/communities/${community.id}`}
        >
          <p className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)}
            {community && ` - ${community.name} Community`}
          </p>

          <Image
            alt={community.name}
            className="ml-1 rounded-full object-cover"
            height={14}
            src={community.image || ''}
            width={14}
          />
        </Link>
      )}
    </article>
  );
};

export default ThreadCard;
