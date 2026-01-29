import { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Card, Overlay, Tooltip, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') setEmailError('');
    if (e.target.name === 'password') setPasswordError('');
    if (e.target.name === 'confirmPassword') setConfirmPasswordError('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailBlur = (e) => {
    const email = e.target.value;
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    }
  };

  const handlePasswordBlur = (e) => {
    const password = e.target.value;
    if (password && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    }
  };

  const handleConfirmPasswordBlur = (e) => {
    const confirmPassword = e.target.value;
    if (confirmPassword && confirmPassword !== formData.password) {
      setConfirmPasswordError("Passwords do not match");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (emailError || !validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (passwordError || formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (confirmPasswordError || formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post('/api/users/register', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch (err) {
      console.error("Registration Error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || "Registration failed. Please try again.";
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-4" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }} className="p-4 shadow">
        <h2 className="text-center mb-4">Sign Up</h2>

        {/* Fallback general error display if needed */}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              ref={emailRef}
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              isInvalid={!!emailError}
              required
            />
            <Overlay target={emailRef.current} show={!!emailError} placement="right">
              {(props) => (
                <Tooltip id="email-error" {...props} style={{ ...props.style, zIndex: 9999 }}>
                  {emailError}
                </Tooltip>
              )}
            </Overlay>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              ref={passwordRef}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handlePasswordBlur}
              isInvalid={!!passwordError}
              required
            />
            <Overlay target={passwordRef.current} show={!!passwordError} placement="right">
              {(props) => (
                <Tooltip id="password-error" {...props} style={{ ...props.style, zIndex: 9999 }}>
                  {passwordError}
                </Tooltip>
              )}
            </Overlay>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              ref={confirmPasswordRef}
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleConfirmPasswordBlur}
              isInvalid={!!confirmPasswordError}
              required
            />
            <Overlay target={confirmPasswordRef.current} show={!!confirmPasswordError} placement="right">
              {(props) => (
                <Tooltip id="confirm-password-error" {...props} style={{ ...props.style, zIndex: 9999 }}>
                  {confirmPasswordError}
                </Tooltip>
              )}
            </Overlay>
          </Form.Group>

          <Button variant="success" type="submit" className="w-100">
            Sign Up
          </Button>
        </Form>
        <div className="text-center mt-3">
          <small>Already have an account? <Link to="/login">Login</Link></small>
        </div>
      </Card>
    </Container>
  );
};

export default Signup;
