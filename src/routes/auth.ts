import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = { username: "user", password: "password" };

  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [username, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");

  if (
    username &&
    password &&
    username === auth.username &&
    password === auth.password
  ) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="401"');
  res.status(401).send("Autenticación requerida.");
};

export default authMiddleware;
