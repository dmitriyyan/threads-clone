import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
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

const Community =
  mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;
