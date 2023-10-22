import mongoose from 'mongoose';

type CommunityType = {
  bio?: string;
  createdBy: mongoose.Types.ObjectId;
  id: string;
  image?: string;
  members: mongoose.Types.ObjectId[];
  name: string;
  threads: mongoose.Types.ObjectId[];
  username: string;
};

const communitySchema = new mongoose.Schema<CommunityType>({
  bio: String,
  createdBy: {
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  },
  id: {
    required: true,
    type: String,
  },
  image: String,
  members: [
    {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  name: {
    required: true,
    type: String,
  },
  threads: [
    {
      ref: 'Thread',
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  username: {
    required: true,
    type: String,
    unique: true,
  },
});
const Community = mongoose.models.Community
  ? mongoose.model<CommunityType>('Community')
  : mongoose.model<CommunityType>('Community', communitySchema);

export default Community;
