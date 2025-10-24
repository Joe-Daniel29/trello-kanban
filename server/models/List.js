const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Path `title` is required.'],
      trim: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('List', ListSchema);

