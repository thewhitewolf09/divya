// AUTH
export { default as register } from "./auth/register.js";
export { default as login } from "./auth/login.js";

//REGISTERED EVENTS
export { default as registeredEvents } from "./get-registered-events.js";
export { default as createdEvents } from "./get-created-events.js";

//SEARCH EVENTS 
export { default as searchEvents } from "./search-events.js";

export { default as verifyEmail } from "./auth/verify-email.js";
export { default as forgotPassword } from "./auth/forgot-password.js";
export { default as sendVerificationCode } from "./auth/send-verification-code.js";

// EDIT
export { default as changePassword } from "./edit/change-password.js";
export { default as editUser } from "./edit/edit-user.js";

// OTHER
export { default as getUser } from "./get-user.js";
export { default as deleteUser } from "./delete-user.js";

