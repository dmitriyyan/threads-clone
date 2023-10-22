import mongoose from 'mongoose';

export type ThreadType = {
  author: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  community?: mongoose.Types.ObjectId;
  createdAt: Date;
  parentId?: string;
  text: string;
};

const threadSchema = new mongoose.Schema<ThreadType>({
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

const Thread = mongoose.models.Thread
  ? mongoose.model<ThreadType>('Thread')
  : mongoose.model<ThreadType>('Thread', threadSchema);

export default Thread;
