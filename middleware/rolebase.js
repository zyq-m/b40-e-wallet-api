const roleMiddleware = roles => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(400).send({ message: "You cannot access this route" });
    }

    next();
  };
};

module.exports = roleMiddleware;
