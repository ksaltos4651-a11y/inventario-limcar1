const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "Falta token" });

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ msg: "Token inválido" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ msg: "Token expirado o inválido" });
  }
}

module.exports = { auth };
