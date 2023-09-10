const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/rolebase");

const { sendFeedback, getFeedback } = require("../utils/feedbackQuery");

const onFeedback = (req, res) => {
  const { id, title, description } = req.body;
  sendFeedback(id, title, description)
    .then(() => {
      res.status(201).send({ message: "Feedback sent successfully" });
    })
    .catch(err => res.status(500).send(err));
};

const onGetFeedback = (req, res) => {
  getFeedback()
    .then(data => {
      res.status(201).json(data);
    })
    .catch(err => res.status(500).send(err));
};

router.post("/", roleMiddleware(["student", "cafe"]), onFeedback);
router.get("/", roleMiddleware(["admin"]), onGetFeedback);

module.exports = router;
