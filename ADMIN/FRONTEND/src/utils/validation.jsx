export const isValidFourDigitPassword = (password) => {
  const passwordRegex = /^\d{4}$/;
  return passwordRegex.test(password);
};
