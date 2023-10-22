import mongoose from 'mongoose';

export type UserType = {
  _id: mongoose.Types.ObjectId;
  bio?: string;
  communities: mongoose.Types.ObjectId[];
  id: string;
  image?: string;
  name: string;
  onboarded?: boolean;
  threads: mongoose.Types.ObjectId[];
  username: string;
};

const userSchema = new mongoose.Schema<UserType>({
  bio: String,
  communities: [
    {
      ref: 'Community',
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  id: {
    required: true,
    type: String,
  },
  image: String,
  name: {
    required: true,
    type: String,
  },
  onboarded: {
    default: false,
    type: Boolean,
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

const User = mongoose.models.User
  ? mongoose.model<UserType>('User')
  : mongoose.model<UserType>('User', userSchema);

export default User;
