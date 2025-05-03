import axios from 'axios';
import React, { useState } from 'react';

const Login = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [passwords, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginFormSubmit = async (e) => {
    e.preventDefault();

    // Validate 4-digit password
    const passwordRegex = /^\d{4}$/;
    if (!passwords || !passwordRegex.test(passwords)) {
      setErrorMessage('Password number must be a 4-digit number.');
      return;
    }

    try {
      const parsedPassword = parseInt(passwords);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/superadmin/CheckLoginCredentials`,
        { email, password: parsedPassword }
      );

      if (response.status === 200 && response.data.status === 'Success') {
        const userData = response.data;
        handleLogin(userData); // Pass full data including user and token
        setErrorMessage('');
        setSuccessMessage('Login successful!');
      } else {
        setErrorMessage('Login failed. ' + (response.data.message || ''));
      }
    } catch (error) {
      setSuccessMessage('');
      if (error.response) {
        setErrorMessage(`Error: ${error.response.data.message || error.response.statusText}`);
      } else {
        setErrorMessage('An error occurred during login. Please try again later.');
      }
    }
  };

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="auth-form-light text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <img src="../../images/dashboard/EV-SUPER-ADMIN-1.png" alt="logo" style={{ width: '72%', height: '110%' }} />
                </div>
                <h4>Hello! let's get started</h4>
                <h6 className="font-weight-light">Sign in to continue</h6>
                <form className="pt-3" onSubmit={handleLoginFormSubmit}>
                  <div className="form-group">
                    <input type="email" className="form-control" placeholder="Enter your email" value={email}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove spaces and invalid characters
                        const noSpaces = value.replace(/\s/g, '');
                        const validChars = noSpaces.replace(/[^a-zA-Z0-9@.]/g, '');
                        // Convert to lowercase
                        const lowerCaseEmail = validChars.toLowerCase();
                        // Handle multiple @ symbols
                        const atCount = (lowerCaseEmail.match(/@/g) || []).length;
                        const sanitizedEmail = atCount <= 1 ? lowerCaseEmail : lowerCaseEmail.replace(/@.*@/, '@');
                        // Set the sanitized and lowercase email
                        setEmail(sanitizedEmail);
                      }} required />
                    {/* <input type="email" className="form-control form-control-lg" placeholder="Enter your email" value={email} onChange={(e) => {const value = e.target.value; const noSpaces = value.replace(/\s/g, ''); const validChars = noSpaces.replace(/[^a-zA-Z0-9@.]/g, ''); const atCount = (validChars.match(/@/g) || []).length; const sanitizedEmail = atCount <= 1 ? validChars : validChars.replace(/@.*@/, '@'); setEmail(sanitizedEmail); }}required/>   */}
                  </div>
                  <div className="form-group">
                    <input type="password" className="form-control form-control-lg" placeholder="Enter your password" value={passwords} maxLength={4} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPassword(sanitizedValue); }} required />
                  </div>
                  {errorMessage && <p className="text-danger">{errorMessage}</p>}<br />
                  {successMessage && <p className="text-success">{successMessage}</p>}<br />
                  <div className="mt-3">
                    <button type="submit" className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn">SIGN IN</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login
