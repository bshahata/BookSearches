const { Class, User } = require('../models');
const { AuthenticationError } = require("appollo-server-express");
const { signToken } = require("../utils/auth");

// Define the functions that will be used to get and modify user data
const resolvers = {
  Query: {
    // Get user data by username
    user: async (parent, { username }) => {
      return User.findOne({ username });
    },

    // Get user data by ID
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      // If user is not logged in, throw an error
      throw new AuthenticationError("Cannot find a user with this ID!");
    },
  },

  Mutation: {
    // Create a new user account
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    // Log in a user and return a token
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Cannot find this user");
      }

      const token = signToken(user);

      return { token, user };
    },

    // Save a book to a user's list of saved books
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        return (updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        ));
      }
      // If user is not logged in, throw an error
      throw new AuthenticationError("You need to be logged in to save a book!");
    },

    // Remove a book from a user's list of saved books
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return (updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        ));
      }
      // If user is not logged in, throw an error
      throw new AuthenticationError("You need to be logged in to remove a book!");
    },
  },
};


module.exports = resolvers;
