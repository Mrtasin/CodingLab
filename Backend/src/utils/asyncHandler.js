const asyncHandler = (requestHandler) => {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err.message);
    });
  };
};

export default asyncHandler;
