const express = require("express");
const router = express.Router();
const pool = require("./query");

const getStudents = (request, response) => {
  pool.query(
    "SELECT matric_no, ic_no, student_name, wallet_amount, active FROM students",
    (error, results) => {
      if (error) return response.sendStatus(500);
      return response.status(200).json(results.rows);
    }
  );
};

const getStudentsById = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT matric_no, ic_no, student_name, wallet_amount, active FROM students WHERE matric_no = $1",
    [id],
    (error, results) => {
      if (error) return response.sendStatus(500);
      if (results.rowCount === 0) return response.sendStatus(404);
      return response.status(200).json(results.rows);
    }
  );
};

const createStudent = (request, response) => {
  const { name, matric_no, ic_no } = request.body;

  pool.query(
    "INSERT INTO students (matric_no, ic_no, student_name, password) VALUES ($1, $2, $3, $4) RETURNING *",
    [matric_no, ic_no, name, ic_no],
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

const setWalletAmount = (request, response) => {
  const id = request.params.id;
  const { amount } = request.body;

  pool.query(
    "UPDATE students SET wallet_amount = $1 WHERE matric_no = $2",
    [amount, id],
    (error, results) => {
      if (error) return response.sendStatus(500);
      if (results.rowCount === 0) return response.sendStatus(404);
      return response.sendStatus(200);
    }
  );
};

const suspendStudents = (request, response) => {
  const id = request.params.id;
  const { active } = request.body;

  pool.query(
    "UPDATE students SET active = $1 WHERE matric_no = $2",
    [active, id],
    (error, results) => {
      if (error) return response.sendStatus(500);
      if (results.rowCount === 0) return response.sendStatus(404);
      return response.sendStatus(200);
    }
  );
};

router.get("/students", getStudents);
router.get("/students/:id", getStudentsById);
router.post("/students", createStudent);
router.put("/students/:id/wallet", setWalletAmount);
router.put("/students/:id/suspend", suspendStudents);

module.exports = router;
