import error_codes from "../lang/en.js";

export default (code, req, errorMessage) => {
  //NOTE: This control routes every server error to the same lang key.
  let key = code;
  if (!error_codes[code]) key = "00008";

  let userId = "";
  if (req && req.user && req.user._id) userId = req.user._id;

  let Message = error_codes[key];

  if (Message.includes("server error")) {
    Message = errorMessage ?? Message
  } else {
    Message= errorMessage ?? Message
  }

  return {
    resultMessage: Message,
    resultCode: code,
  };
};


