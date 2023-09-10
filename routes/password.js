const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/rolebase");
const {
  changeCafe,
  changeStudent,
  checkCafe,
  checkStudent,
} = require("../utils/passwordQuery");

router.put("/students/:id", roleMiddleware(["student"]), async (req, res) => {
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

router.put("/cafe/:id", roleMiddleware(["cafe"]), async (req, res) => {
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

module.exports = router;
