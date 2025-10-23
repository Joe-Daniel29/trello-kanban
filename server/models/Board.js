const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BoardSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    // THIS IS THE FIX:
    // We must add the 'lists' field so Mongoose can populate it.
    lists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'List',
      },
    ],
  },
  { timestamps: true } // This automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Board', BoardSchema);

