import { type CommunityType } from '../community';
import { type UserType } from '../user';
import mongoose from 'mongoose';

export type ThreadType = {
  _id: mongoose.Types.ObjectId;
  author: UserType;
  children: ThreadDocumentType[];
  community?: CommunityType;
  createdAt: Date;
  parentId?: string;
  text: string;
};

type ThreadDTO = {
  author: {
    id: string;
    image?: string;
    name: string;
  };
  children: ThreadDTO[];
  community?: {
    id: string;
    image?: string;
    name: string;
  };
  content: string;
  createdAt: string;
  id: string;
  parentId?: string;
};

type ThreadDocumentType = ThreadType &
  mongoose.Document<mongoose.Types.ObjectId, {}, ThreadType> & {
    toDTO: (this: ThreadDocumentType) => ThreadDTO;
  };

type ThreadModelType = mongoose.Model<ThreadDocumentType>;

const ThreadSchema = new mongoose.Schema<ThreadType, ThreadModelType>({
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

ThreadSchema.methods.toDTO = function (this: ThreadDocumentType): ThreadDTO {
  const id = this._id.toString();

  return {
    author: {
      id: this.author.id,
      image: this.author.image,
      name: this.author.name,
    },
    children: this.children.map((child) => child.toDTO()),
    community: this.community && {
      id: this.community.id,
      image: this.community.image,
      name: this.community.name,
    },
    content: this.text,
    createdAt: this.createdAt.toDateString(),
    id,
    parentId: this.parentId,
  };
};

const Thread = mongoose.models.Thread
  ? mongoose.model<ThreadType, ThreadModelType>('Thread')
  : mongoose.model<ThreadType, ThreadModelType>('Thread', ThreadSchema);

export default Thread;
