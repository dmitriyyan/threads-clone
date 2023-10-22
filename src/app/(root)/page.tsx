/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ThreadCard } from '@/components/cards/ThreadCard';
import { Pagination } from '@/components/shared/Pagination';
import { fetchPosts } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  const result = await fetchPosts(
    searchParams.page ? Number(searchParams.page) : 1,
    30,
  );

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard
                /* @ts-expect-error */
                author={post.author}
                /* @ts-expect-error */
                comments={post.children}
                /* @ts-expect-error */
                community={post.community}
                content={post.text}
                /* @ts-expect-error */
                createdAt={post.createdAt}
                currentUserId={user.id}
                id={post._id.toString()}
                key={post._id.toString()}
                parentId={post.parentId || ''}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        isNext={result.isNext}
        pageNumber={searchParams?.page ? Number(searchParams.page) : 1}
        path="/"
      />
    </>
  );
};

export default Page;
