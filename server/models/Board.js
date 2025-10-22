const mongoose = require('mongoose');

const boardSchema = mongoose.Schema(
  {
    // This field should be 'user' to match the controller logic
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Board', boardSchema);

