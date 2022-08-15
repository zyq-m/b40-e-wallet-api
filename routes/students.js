const express = require("express");
const router = express.Router();
const pool = require("./query");

const getStudents = (request, response) => {
  pool.query("SELECT * FROM students", (error, results) => {
    if (error) return response.sendStatus(500);
    return response.status(200).json(results.rows);
  });
};

const getStudentsById = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT * FROM students WHERE matric_no = $1",
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
    "INSERT INTO students (matric_no, ic_no, student_name) VALUES ($1, $2, $3) RETURNING *",
    [matric_no, ic_no, name],
    (error, results) => {
      if (error) return response.sendStatus(500);
      return response
        .status(201)
        .send(`User added with ID: ${results.rows[0].matric_no}`);
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
      return response.status(200).send("Amount successfully set");
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
      return response
        .status(200)
        .send(`Students suspended with matric no: ${id}`);
    }
  );
};

router.get("/students", getStudents);
router.get("/students/:id", getStudentsById);
router.post("/students", createStudent);
router.put("/students/:id/wallet", setWalletAmount);
router.put("/students/:id/suspend", suspendStudents);

module.exports = router;
