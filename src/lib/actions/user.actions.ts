'use server';

import Community from '../models/community';
import Thread from '../models/thread';
import User from '../models/user';
import { connectToDB } from '../mongoose';
import { type FilterQuery, type SortOrder } from 'mongoose';
import { revalidatePath } from 'next/cache';

export const fetchUser = async (userId: string) => {
  connectToDB();

  return await User.findOne({ id: userId }).populate({
    model: Community,
    path: 'communities',
  });
};

type Parameters = {
  bio: string;
  image: string;
  name: string;
  path: string;
  userId: string;
  username: string;
};

export const updateUser = async ({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Parameters): Promise<void> => {
  connectToDB();

  await User.findOneAndUpdate(
    { id: userId },
    {
      bio,
      image,
      name,
      onboarded: true,
      username: username.toLowerCase(),
    },
    { upsert: true },
  );

  if (path === '/profile/edit') {
    revalidatePath(path);
  }
};

export const fetchUserPosts = async (userId: string) => {
  connectToDB();

  // Find all threads authored by the user with the given userId
  const threads = await User.findOne({ id: userId }).populate({
    model: Thread,
    path: 'threads',
    populate: [
      {
        model: Community,
        path: 'community',
        select: 'name id image _id', // Select the "name" and "_id" fields from the "Community" model
      },
      {
        model: Thread,
        path: 'children',
        populate: {
          model: User,
          path: 'author',
          select: 'name image id', // Select the "name" and "_id" fields from the "User" model
        },
      },
    ],
  });
  return threads;
};

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export const fetchUsers = async ({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  sortBy?: SortOrder;
  userId: string;
}) => {
  connectToDB();

  // Calculate the number of users to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a case-insensitive regular expression for the provided search string.
  const regex = new RegExp(searchString, 'iu');

  // Create an initial query object to filter users.
  const query: FilterQuery<typeof User> = {
    id: { $ne: userId }, // Exclude the current user from the results.
  };

  // If the search string is not empty, add the $or operator to match either username or name fields.
  if (searchString.trim() !== '') {
    // eslint-disable-next-line canonical/id-match
    query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }];
  }

  // Define the sort options for the fetched users based on createdAt field and provided sort order.
  const sortOptions = { createdAt: sortBy };

  const usersQuery = User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize);

  // Count the total number of users that match the search criteria (without pagination).
  const totalUsersCount = await User.countDocuments(query);

  const users = await usersQuery.exec();

  // Check if there are more users beyond the current page.
  const isNext = totalUsersCount > skipAmount + users.length;

  return { isNext, users };
};

export const getActivity = async (userId: string) => {
  connectToDB();

  // Find all threads created by the user
  const userThreads = await Thread.find({ author: userId });

  // Collect all the child thread ids (replies) from the 'children' field of each user thread
  const childThreadIds = [];
  for (const userThread of userThreads) {
    childThreadIds.push(...userThread.children);
  }

  // Find and return the child threads (replies) excluding the ones created by the same user
  const replies = await Thread.find({
    _id: { $in: childThreadIds },
    author: { $ne: userId }, // Exclude threads authored by the same user
  }).populate({
    model: User,
    path: 'author',
    select: 'name image _id',
  });

  return replies;
};
