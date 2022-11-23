const express = require("express");
const passwordRouter = express.Router();
const {
  changeCafe,
  changeStudent,
  checkCafe,
  checkStudent,
} = require("../utils/passwordQuery");

passwordRouter.put("/password/students/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // check curr password
    const isExist = await checkStudent(id, currentPassword);

    if (isExist === 0) {
      return res.sendStatus(404);
    }

    // change pasword
    const password = await changeStudent(id, newPassword);

    if (password === 0) {
      return res.sendStatus(404);
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

passwordRouter.put("/password/cafe/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // check curr password
    const isExist = await checkCafe(id, currentPassword);

    if (isExist === 0) {
      return res.sendStatus(404);
    }

    // change pasword
    await changeCafe(id, newPassword);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = passwordRouter;
