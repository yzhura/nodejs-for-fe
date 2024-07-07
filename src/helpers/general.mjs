import { USER_NAME_REGEX } from "../constants/regex.mjs";

export const validateUsername = (username) => USER_NAME_REGEX.test(username);
