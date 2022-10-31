const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const ObjectID = require("mongoose").Types.ObjectId;
const router = new express.Router();

//tasks table
//create task using rest api
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//read  task by id using rest api
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(406).send("User with that invalid id does not exist!");
  }
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
//read all tasks using rest api
//completed=false
//limit=10 & skip=0 => pagination
//sort by createdAt desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortedBy) {
    const parts = req.query.sortedBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

//update task by id using rest api
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOpration = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOpration) {
    return res.status(400).send("Error:  invalid updates!");
  }
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(406).send("task with that invalid id does not exist!");
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
//delete task by id using rest api
router.delete("/tasks/:id", auth, async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(406).send("Task with that invalid id does not exist!");
  }
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
