'use server';

import Community from '../models/community';
import Thread from '../models/thread';
import User from '../models/user';
import { connectToDB } from '../mongoose';
import { type FilterQuery, type SortOrder } from 'mongoose';

export const createCommunity = async (
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string, // Change the parameter name to reflect it's an id
) => {
  connectToDB();

  // Find the user with the provided unique id
  const user = await User.findOne({ id: createdById });

  if (!user) {
    throw new Error('User not found'); // Handle the case if the user with the id is not found
  }

  const newCommunity = new Community({
    bio,
    createdBy: user._id,
    id,
    image,
    name,
    username, // Use the mongoose ID of the user
  });

  const createdCommunity = await newCommunity.save();

  // Update User model
  user.communities.push(createdCommunity._id);
  await user.save();

  return createdCommunity;
};

export const fetchCommunityDetails = async (id: string) => {
  connectToDB();

  const communityDetails = await Community.findOne({ id }).populate([
    'createdBy',
    {
      model: User,
      path: 'members',
      select: 'name username image _id id',
    },
  ]);

  return communityDetails;
};

export const fetchCommunityPosts = async (id: string) => {
  connectToDB();

  const communityPosts = await Community.findById(id).populate({
    model: Thread,
    path: 'threads',
    populate: [
      {
        model: User,
        path: 'author',
        select: 'name image id', // Select the "name" and "_id" fields from the "User" model
      },
      {
        model: Thread,
        path: 'children',
        populate: {
          model: User,
          path: 'author',
          select: 'image _id', // Select the "name" and "_id" fields from the "User" model
        },
      },
    ],
  });

  return communityPosts;
};

export const fetchCommunities = async ({
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  sortBy?: SortOrder;
}) => {
  connectToDB();

  // Calculate the number of communities to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a case-insensitive regular expression for the provided search string.
  const regex = new RegExp(searchString, 'iu');

  // Create an initial query object to filter communities.
  const query: FilterQuery<typeof Community> = {};

  // If the search string is not empty, add the $or operator to match either username or name fields.
  if (searchString.trim() !== '') {
    // eslint-disable-next-line canonical/id-match
    query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }];
  }

  // Define the sort options for the fetched communities based on createdAt field and provided sort order.
  const sortOptions = { createdAt: sortBy };

  // Create a query to fetch the communities based on the search and sort criteria.
  const communitiesQuery = Community.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize)
    .populate('members');

  // Count the total number of communities that match the search criteria (without pagination).
  const totalCommunitiesCount = await Community.countDocuments(query);

  const communities = await communitiesQuery.exec();

  // Check if there are more communities beyond the current page.
  const isNext = totalCommunitiesCount > skipAmount + communities.length;

  return { communities, isNext };
};

export const addMemberToCommunity = async (
  communityId: string,
  memberId: string,
) => {
  connectToDB();

  // Find the community by its unique id
  const community = await Community.findOne({ id: communityId });

  if (!community) {
    throw new Error('Community not found');
  }

  // Find the user by their unique id
  const user = await User.findOne({ id: memberId });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if the user is already a member of the community
  if (community.members.includes(user._id)) {
    throw new Error('User is already a member of the community');
  }

  // Add the user's _id to the members array in the community
  community.members.push(user._id);
  await community.save();

  // Add the community's _id to the communities array in the user
  user.communities.push(community._id);
  await user.save();

  return community;
};

export const removeUserFromCommunity = async (
  userId: string,
  communityId: string,
) => {
  connectToDB();

  const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
  const communityIdObject = await Community.findOne(
    { id: communityId },
    { _id: 1 },
  );

  if (!userIdObject) {
    throw new Error('User not found');
  }

  if (!communityIdObject) {
    throw new Error('Community not found');
  }

  // Remove the user's _id from the members array in the community
  await Community.updateOne(
    { _id: communityIdObject._id },
    { $pull: { members: userIdObject._id } },
  );

  // Remove the community's _id from the communities array in the user
  await User.updateOne(
    { _id: userIdObject._id },
    { $pull: { communities: communityIdObject._id } },
  );

  return { success: true };
};

export const updateCommunityInfo = async (
  communityId: string,
  name: string,
  username: string,
  image: string,
) => {
  connectToDB();

  // Find the community by its _id and update the information
  const updatedCommunity = await Community.findOneAndUpdate(
    { id: communityId },
    { image, name, username },
  );

  if (!updatedCommunity) {
    throw new Error('Community not found');
  }

  return updatedCommunity;
};

export const deleteCommunity = async (communityId: string) => {
  connectToDB();

  // Find the community by its ID and delete it
  const deletedCommunity = await Community.findOneAndDelete({
    id: communityId,
  });

  if (!deletedCommunity) {
    throw new Error('Community not found');
  }

  // Delete all threads associated with the community
  await Thread.deleteMany({ community: communityId });

  // Find all users who are part of the community
  const communityUsers = await User.find({ communities: communityId });
  // Remove the community from the 'communities' array for each user
  User.updateMany(
    { _id: { $in: communityUsers.map((user) => user._id) } },
    { $pull: { communities: communityId } },
  );

  return deletedCommunity;
};
