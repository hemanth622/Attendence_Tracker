import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUserPlus, FaIdBadge, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Register = ({ onShowLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    try {
      register({
        studentId,
        name,
        email,
        password
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container fluid className="vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Row className="h-100">
        <Col lg={6} className="d-flex align-items-center justify-content-center">
          <div className="login-form-container">
            <div className="text-center mb-4">
              <FaUserPlus className="text-primary" style={{ fontSize: '3rem' }} />
              <h2 className="mt-3 mb-1">Create Account</h2>
              <p className="text-muted">Join the attendance tracking system</p>
            </div>

            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Student ID</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaIdBadge />
                      </span>
                      <Form.Control 
                        type="text" 
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                      />
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                      <Form.Control 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <Form.Control 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <Form.Control 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </Form.Group>
                  
                  <Button type="submit" variant="primary" className="w-100 mb-3">
                    <FaUserPlus className="me-2" />Create Account
                  </Button>
                </Form>
                
                <div className="text-center">
                  <p className="mb-0">Already have an account? 
                    <Button variant="link" className="text-primary fw-bold p-0 ms-1" onClick={onShowLogin}>
                      Login here
                    </Button>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
        
        <Col lg={6} className="bg-primary d-none d-lg-flex align-items-center justify-content-center text-white">
          <div className="text-center">
            <FaUserPlus className="mb-4" style={{ fontSize: '4rem', opacity: 0.8 }} />
            <h3 className="mb-4">Secure & Private</h3>
            <p className="lead mb-4">Your attendance data is stored securely in your browser and accessible only with your credentials.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register; 