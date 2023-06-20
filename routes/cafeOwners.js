const express = require("express");
const router = express.Router();
const pool = require("./query");

const getCafe = (request, response) => {
  pool.query(
    "SELECT username, owner_name, active, cafe_name FROM cafe_owners WHERE dummy = false",
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
    "INSERT INTO cafe_owners (username, password, owner_name, cafe_name) VALUES ($1, crypt($2, gen_salt('bf')), $3, $4) RETURNING *",
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

const getProfile = (req, res) => {
  const id = req.params.id;
  const sql = `
  SELECT bank_name, account_no 
  FROM cafe_owners
  WHERE username = $1
  `;

  pool
    .query(sql, [id])
    .then(data => {
      if (data.rowCount === 0) return res.sendStatus(404);
      return res.status(200).json(data.rows[0]);
    })
    .catch(err => res.status(500).json(err));
};

const updateProfile = (req, res) => {
  const id = req.params.id;
  const { bankName, accountNo } = req.body;

  const sql = `
  UPDATE cafe_owners 
  SET bank_name = $1, account_no = $2
  WHERE username = $3
  `;

  if (!bankName || !accountNo) return res.sendStatus(400);

  pool
    .query(sql, [bankName, accountNo, id])
    .then(data => {
      if (data.rowCount === 0) return res.sendStatus(404);
      return res.status(200).json(data.rows[0]);
    })
    .catch(err => res.status(500).json(err));
};

const countCafe = (req, res) => {
  pool
    .query(
      "SELECT count(username) total_cafe from cafe_owners WHERE dummy = false"
    )
    .then(data => {
      if (data.rowCount == 0) {
        return res.sendStatus(404);
      }

      return res.status(200).json(data.rows[0]);
    })
    .catch(err => res.status(500).json(err));
};

router.get("/cafe", getCafe);
router.get("/cafe/total", countCafe);
router.get("/cafe/account", getCafeAcc);
router.get("/cafe/profile/:id", getProfile);
router.put("/cafe/profile/:id", updateProfile);
router.get("/cafe/:id", getCafeById);
router.post("/cafe", createCafe);
router.put("/cafe/:id/suspend", suspendCafe);
router.get("/cafe/:id/transactions", getTransactions);

module.exports = router;
