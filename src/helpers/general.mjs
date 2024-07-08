import { DATE_REGEX, USER_NAME_REGEX } from "../constants/regex.mjs";
import _ from "lodash";

export const validateUsername = (username) => USER_NAME_REGEX.test(username);

export const validateDate = (dateStr) => {
  if (!DATE_REGEX.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

export const validateDescription = (description) =>
  typeof description === "string" && description.trim().length > 0;

export const sanitizeDescription = (description) => _.escape(description);
