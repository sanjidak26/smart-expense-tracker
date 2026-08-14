import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token (JWT) containing the user ID
 * @param {string} id - The MongoDB user ID
 * @returns {string} The signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;
