'use server';

import Community from '../models/community';
import Thread from '../models/thread';
import User from '../models/user';
import { connectToDB } from '../mongoose';
import { revalidatePath } from 'next/cache';

export const fetchPosts = async (pageNumber = 1, pageSize = 20) => {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      model: User,
      path: 'author',
    })
    .populate({
      model: Community,
      path: 'community',
    })
    .populate({
      path: 'children', // Populate the children field
      populate: {
        // Populate the author field within children
        model: User,
        path: 'author',
        select: '_id name parentId image', // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { isNext, posts: posts.map((post) => post.toDTO()) };
};

type Parameters = {
  author: string;
  communityId: string | null;
  path: string;
  text: string;
};

export const createThread = async ({
  text,
  author,
  communityId,
  path,
}: Parameters) => {
  connectToDB();

  const communityIdObject = await Community.findOne(
    { id: communityId },
    { _id: 1 },
  );

  const createdThread = await Thread.create({
    author,
    community: communityIdObject,
    text, // Assign communityId if provided, or leave it null for personal account
  });

  // Update User model
  await User.findByIdAndUpdate(author, {
    $push: { threads: createdThread._id },
  });

  if (communityIdObject) {
    // Update Community model
    await Community.findByIdAndUpdate(communityIdObject, {
      $push: { threads: createdThread._id },
    });
  }

  revalidatePath(path);
};

const fetchAllChildThreads = async (threadId: string) => {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads: typeof childThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id.toString());
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
};

export const deleteThread = async (id: string, path: string) => {
  connectToDB();

  // Find the thread to be deleted (the main thread)
  const mainThread = await Thread.findById(id).populate('author community');

  if (!mainThread) {
    throw new Error('Thread not found');
  }

  // Fetch all child threads and their descendants recursively
  const descendantThreads = await fetchAllChildThreads(id);

  // Get all descendant thread IDs including the main thread ID and child thread IDs
  const descendantThreadIds = [
    id,
    ...descendantThreads.map((thread) => thread._id),
  ];

  // Extract the authorIds and communityIds to update User and Community models respectively
  const uniqueAuthorIds = new Set(
    [
      ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
      mainThread.author?._id?.toString(),
    ].filter(Boolean),
  );

  const uniqueCommunityIds = new Set(
    [
      ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
      mainThread.community?._id?.toString(),
    ].filter(Boolean),
  );

  // Recursively delete child threads and their descendants
  await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

  // Update User model
  await User.updateMany(
    { _id: { $in: Array.from(uniqueAuthorIds) } },
    { $pull: { threads: { $in: descendantThreadIds } } },
  );

  // Update Community model
  await Community.updateMany(
    { _id: { $in: Array.from(uniqueCommunityIds) } },
    { $pull: { threads: { $in: descendantThreadIds } } },
  );

  revalidatePath(path);
};

export const fetchThreadById = async (threadId: string) => {
  connectToDB();

  const thread = await Thread.findById(threadId)
    .populate({
      model: User,
      path: 'author',
      select: '_id id name image',
    }) // Populate the author field with _id and username
    .populate({
      model: Community,
      path: 'community',
      select: '_id id name image',
    }) // Populate the community field with _id and name
    .populate({
      path: 'children', // Populate the children field
      populate: [
        {
          // Populate the author field within children
          model: User,
          path: 'author',
          select: '_id id name parentId image', // Select only _id and username fields of the author
        },
        {
          // Populate the children field within children
          model: Thread,
          path: 'children', // The model of the nested children (assuming it's the same "Thread" model)
          populate: {
            // Populate the author field within nested children
            model: User,
            path: 'author',
            select: '_id id name parentId image', // Select only _id and username fields of the author
          },
        },
      ],
    })
    .exec();

  if (thread) {
    return thread.toDTO();
  }

  return null;
};

export const addCommentToThread = async (
  threadId: string,
  commentText: string,
  userId: string,
  path: string,
) => {
  connectToDB();

  // Find the original thread by its ID
  const originalThread = await Thread.findById(threadId);

  if (!originalThread) {
    throw new Error('Thread not found');
  }

  // Create the new comment thread
  const commentThread = new Thread({
    author: userId,
    parentId: threadId,
    text: commentText, // Set the parentId to the original thread's ID
  });

  // Save the comment thread to the database
  const savedCommentThread = await commentThread.save();

  // Add the comment thread's ID to the original thread's children array
  originalThread.children.push(savedCommentThread.id);

  // Save the updated original thread to the database
  await originalThread.save();

  revalidatePath(path);
};
