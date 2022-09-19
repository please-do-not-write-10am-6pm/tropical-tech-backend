import { sign, verify } from "jsonwebtoken";
import createHttpError from "http-errors";

export const generateToken = async (payload, secret) => {
  const token = sign(payload, secret, {
    expiresIn: "24h",
  });
  return token;
};

export const verifyToken = (token, secret) => {
  try {
    const decodedInfo = verify(token, secret);
    return decodedInfo;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw createHttpError(401, "Token Expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw createHttpError(401, "Token Invalid");
    }
    throw error;
  }
};
