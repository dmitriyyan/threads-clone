'use server';

import User from '../models/user';
import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export const fetchUser = async (userId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  return user;
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
  const data = {
    bio,
    image,
    name,
    onboarded: true,
    username: username.toLowerCase(),
  };
  await prisma.user.upsert({
    create: { ...data, id: userId },
    update: data,
    where: { id: userId },
  });

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
  const user = await prisma.user.findFirst({
    include: {
      threads: {
        include: {
          children: {
            include: {
              author: {
                select: {
                  id: true,
                  image: true,
                  name: true,
                },
              },
            },
          },
          community: {
            select: {
              id: true,
              image: true,
              mongo_id: true,
              name: true,
            },
          },
        },
      },
    },
    where: { id: userId },
  });
  return user?.threads;
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
  sortBy?: 'asc' | 'desc';
  userId: string;
}) => {
  // Calculate the number of users to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a case-insensitive regular expression for the provided search string.
  // Create an initial query object to filter users.

  const query: Prisma.UserWhereInput = {
    id: userId, // Exclude the current user from the results.
  };

  // If the search string is not empty, add the $or operator to match either username or name fields.
  if (searchString.trim() !== '') {
    query.OR = [
      { username: { contains: searchString, mode: 'insensitive' } },
      { name: { contains: searchString, mode: 'insensitive' } },
    ];
  }

  // Define the sort options for the fetched users based on createdAt field and provided sort order.

  const users = await prisma.user.findMany({
    include: {
      threads: {
        select: {
          createdAt: true,
        },
      },
    },
    orderBy: [
      {
        threads: {
          _count: sortBy,
        },
      },
    ],
    skip: skipAmount,
    take: pageSize,
    where: query,
  });

  // Count the total number of users that match the search criteria (without pagination).
  const total = await prisma.user.count({ where: query });

  // Check if there are more users beyond the current page.
  const isNext = total > skipAmount + users.length;

  return { isNext, users };
};

export const getActivity = async (userId: string) => {
  // Find all threads created by the user
  const userThreads = await prisma.thread.findMany({
    include: {
      children: true,
    },
    where: { authorId: userId },
  });

  // Collect all the child thread ids (replies) from the 'children' field of each user thread
  const childThreadIds = [];
  for (const userThread of userThreads) {
    childThreadIds.push(...userThread.children.map((child) => child.id));
  }

  // Find and return the child threads (replies) excluding the ones created by the same user
  const replies = await prisma.thread.findMany({
    include: {
      author: {
        select: {
          image: true,
          mongo_id: true,
          name: true,
        },
      },
    },
    where: {
      authorId: { not: userId }, // Exclude threads authored by the same user
      id: { in: childThreadIds },
    },
  });

  return replies;
};
