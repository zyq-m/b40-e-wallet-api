const express = require("express");
const router = express.Router();
const pool = require("./query");

const getCafe = (request, response) => {
  pool.query(
    "SELECT username, owner_name, active, cafe_name FROM cafe_owners",
    (error, results) => {
      if (error) return response.status(500);
      return response.status(200).json(results.rows);
    }
  );
};

const getCafeAcc = (request, response) => {
  pool.query(
    "SELECT username, owner_name, active, cafe_name, password FROM cafe_owners",
    (error, results) => {
      if (error) return response.status(500);
      return response.status(200).json(results.rows);
    }
  );
};

const getCafeById = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT username, owner_name, active, cafe_name FROM cafe_owners WHERE username = $1",
    [id],
    (error, results) => {
      if (error) return response.sendStatus(500);
      if (results.rowCount === 0) return response.sendStatus(404);
      return response.status(200).json(results.rows);
    }
  );
};

const createCafe = (request, response) => {
  const { username, password, owner_name, cafe_name } = request.body;

  pool.query(
    "INSERT INTO cafe_owners (username, password, owner_name, cafe_name) VALUES ($1, $2, $3, $4) RETURNING *",
    [username, password, owner_name, cafe_name],
    (error, results) => {
      if (error) {
        if (error.code === "23505") {
          return response.send("user exist").status(500);
        }
        return response.sendStatus(500);
      }

      return response.sendStatus(201);
    }
  );
};

const suspendCafe = (request, response) => {
  const id = request.params.id;
  const { active } = request.body;

  pool.query(
    "UPDATE cafe_owners SET active = $1 WHERE username = $2",
    [active, id],
    (error, results) => {
      if (error) return response.status(500);
      if (results.rowCount === 0) return response.sendStatus(404);
      return response.status(200).send(`Cafe suspended with username: ${id}`);
    }
  );
};

const getTransactions = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT * FROM transactions WHERE recipient = $1",
    [id],
    (error, results) => {
      if (error) return response.status(500);
      if (results.rowCount === 0) return response.sendStatus(404);
      return response.status(200).json(results.rows);
    }
  );
};

router.get("/cafe", getCafe);
router.get("/cafe/account", getCafeAcc);
router.get("/cafe/:id", getCafeById);
router.post("/cafe", createCafe);
router.put("/cafe/:id/suspend", suspendCafe);
router.get("/cafe/:id/transactions", getTransactions);

module.exports = router;
