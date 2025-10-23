const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    list: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    // --- NEW FIELD ---
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // --- --- --- ---
    // We can add more Trello-like fields here later
    // description: { type: String },
    // dueDate: { type: Date },
    // labels: [{ type: String }],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Task', TaskSchema);

