import { Log } from "../models/index.js";


export default async (code, userId, errorMessage, level, req) => {
  let log = new Log({
    resultCode: code,
    level: level,
    errorMessage: errorMessage,
  });

  if (userId !== "" && userId) log.userId = userId;

  console.log(log)
};
