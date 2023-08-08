const User = require("../models/User.js");
const Note = require("../models/Note.js");

// use this library to catch errors
// const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private

const getAllUsers = async (req, res) => {
  //select all users without the password
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
};

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body;

  //confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicates
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash the password
  const hashPassword = await bcrypt.hash(password, 10);

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashPassword }
      : { username, password: hashPassword, roles };

  // Create and save or store new user
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};

// @desc Update user
// @route PATCH /users
// @access Private

const updateUser = async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  //confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    res.status(400).json({ message: "User not found" });
  }

  //check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  //allow update to original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10); //salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
};

// @desc Delete user
// @route DELETE /users
// @access Private

const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result.id} deleted`;

  res.json({ reply });
};

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
