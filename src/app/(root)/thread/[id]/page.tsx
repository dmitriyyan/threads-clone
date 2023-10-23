import { ThreadCard } from '@/components/cards/ThreadCard';
import { Comment } from '@/components/forms/Comment';
import { fetchThreadById } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export const revalidate = 0;

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  const thread = await fetchThreadById(params.id);
  if (!thread) return null;

  return (
    <section className="relative">
      <div>
        <ThreadCard
          author={thread.author}
          comments={thread.children}
          community={thread.community}
          content={thread.content}
          createdAt={thread.createdAt}
          currentUserId={user.id}
          id={thread.id}
          parentId={thread.parentId || ''}
        />
      </div>

      <div className="mt-7">
        <Comment
          currentUserId={JSON.stringify(userInfo.mongo_id)}
          currentUserImg={user.imageUrl}
          threadId={params.id}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((childItem) => (
          <ThreadCard
            author={childItem.author}
            comments={childItem.children}
            community={childItem.community}
            content={childItem.content}
            createdAt={childItem.createdAt}
            currentUserId={user.id}
            id={childItem.id}
            isComment
            key={childItem.id}
            parentId={childItem.parentId}
          />
        ))}
      </div>
    </section>
  );
};

export default Page;
