import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
