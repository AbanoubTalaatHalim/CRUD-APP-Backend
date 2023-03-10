const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Task model
const Task = require("../../models/Task");

// Profile model
const Profile = require("../../models/Profile");

// Validation
const validateTaskInput = require("../../validation/Task");

// @route   GET api/Tasks/test
// @desc    Tests Task route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Tasks Works" }));

// @route   GET api/Tasks
// @desc    Get Tasks
// @access  Public
router.get("/", (req, res) => {
  Task.find()
    .sort({ date: -1 })
    .then((tasks) => res.json(tasks))
    .catch((err) => res.status(404).json({ notasksfound: "No tasks found" }));
});

// @route   GET api/tasks/:id
// @desc    Get task by Id
// @access  Public
router.get("/:id", (req, res) => {
  Task.findById(req.params.id)
    .then((task) => res.json(task))
    .catch((err) =>
      res.status(404).json({ notaskfound: "No task found with that id" })
    );
});

// @route   TASK api/posts
// @desc    Create task
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Task({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    });
    newTask.save().then((task) => res.json(task));
  }
);

// @route   DELETE api/task/:id
// @desc    Delete task
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Task.findById(req.params.id)
        .then((task) => {
          // Check for task owner
          if (task.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          // Delete
          task.remove().then(() => res.json({ success: true }));
        })
        .catch((err) =>
          res.status(404).json({ tasknotfound: "No task found" })
        );
    });
  }
);

// @route   POST api/tasks/like/:id
// @desc    Like task
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      task.findById(req.params.id)
        .then((task) => {
          if (
            task.likes.filter((like) => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this task" });
          }

          // Add user id to likes array
          task.likes.unshift({ user: req.user.id });

          task.save().then((task) => res.json(task));
        })
        .catch((err) =>
          res.status(404).json({ tasknotfound: "No task found" })
        );
    });
  }
);

// @route   task api/tasks/unlike/:id
// @desc    Unlike task
// @access  Private
router.task(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Task.findById(req.params.id)
        .then((task) => {
          if (
            task.likes.filter((like) => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this task" });
          }

          // Get remove index
          const removeIndex = task.likes
            .map((item) => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          task.likes.splice(removeIndex, 1);

          // Save
          task.save().then((task) => res.json(task));
        })
        .catch((err) =>
          res.status(404).json({ tasknotfound: "No task found" })
        );
    });
  }
);

// @route   POST api/task/comment/:id
// @desc    Add comment to task
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTaskInput(req.body);

    // Check validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    Task.findById(req.params.id)
      .then((task) => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id,
        };

        // Add to comments array
        task.comments.unshift(newComment);

        // Save
        task.save().then((task) => res.json(task));
      })
      .catch((err) => res.status(404).json({ tasknotfound: "No task found" }));
  }
);

// @route   DELETE api/tasks/comment/:id/:comment_id
// @desc    Remove comment from task
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    task.findById(req.params.id)
      .then((task) => {
        // Check to see if the comment exists
        if (
          task.comments.filter(
            (comment) => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exists" });
        }

        // Get remove index
        const removeIndex = task.comments
          .map((item) => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        task.comments.splice(removeIndex, 1);

        // Save
        task.save().then((task) => res.json(task));
      })
      .catch((err) => res.status(404).json({ tasknotfound: "No task found" }));
  }
);

module.exports = router;
