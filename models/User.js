const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Age must be an integer',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: "Role must be either 'user' or 'admin'",
      },
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Format returned JSON to remove password if it exists, __v, and make _id mapping standard if desired
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
