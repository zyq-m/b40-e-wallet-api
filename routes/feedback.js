const express = require("express");
const feedbackRouter = express.Router();

const { sendFeedback, getFeedback } = require("../sqlQuey/feedbackQuery");

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

feedbackRouter.post("/feedback", onFeedback);
feedbackRouter.get("/feedback", onGetFeedback);

module.exports = feedbackRouter;
