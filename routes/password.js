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

    if (!isExist) {
      return res.sendStatus(404);
    }

    // change pasword
    const password = await changeStudent(id, newPassword);

    if (!password) {
      return res.sendStatus(404);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

passwordRouter.put("/password/cafe/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // check curr password
    const isExist = await checkCafe(id, currentPassword);

    if (!isExist) {
      return res.sendStatus(404);
    }

    // change pasword
    const password = await changeCafe(id, newPassword);

    if (!password) {
      return res.sendStatus(404);
    }

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
});

module.exports = passwordRouter;
