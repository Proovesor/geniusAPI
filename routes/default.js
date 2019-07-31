exports.getDefault = (req, res, next) => {
  res.status(200).redirect("/main");
  next();
};
