import jwt from "jsonwebtoken";

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function signResponderToken(responderId) {
  return jwt.sign({ role: "responder", responderId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyResponderToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
