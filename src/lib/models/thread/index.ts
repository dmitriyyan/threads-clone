import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  author: {
    ref: 'User',
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  children: [
    {
      ref: 'Thread',
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  community: {
    ref: 'Community',
    type: mongoose.Schema.Types.ObjectId,
  },
  createdAt: {
    default: Date.now,
    type: Date,
  },
  parentId: {
    type: String,
  },
  text: {
    required: true,
    type: String,
  },
});

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;
