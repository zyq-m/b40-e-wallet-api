const studentRole = (req, res, next) => {
  if (req?.user?.role == "student") {
    next();
    return;
  }

  res.status(400).send({ message: "You cannot access this route" });
};

const cafeRole = (req, res, next) => {
  if (req?.user?.role == "cafe") {
    next();
    return;
  }

  res.status(400).send({ message: "You cannot access this route" });
};

const adminRole = (req, res, next) => {
  if (req?.user?.role == "admin") {
    next();
    return;
  }

  res.status(400).send({ message: "You cannot access this route" });
};

module.exports = { studentRole, cafeRole, adminRole };
