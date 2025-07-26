import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaGraduationCap, FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onShowRegister }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const users = JSON.parse(localStorage.getItem('attendanceUsers') || '{}');
    
    if (users[studentId] && users[studentId].password === password) {
      login(users[studentId]);
    } else {
      setError('Invalid student ID or password!');
    }
  };

  return (
    <Container fluid className="vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Row className="h-100">
        <Col lg={6} className="d-flex align-items-center justify-content-center">
          <div className="login-form-container">
            <div className="text-center mb-4">
              <FaGraduationCap className="text-primary" style={{ fontSize: '3rem' }} />
              <h2 className="mt-3 mb-1">Student Login</h2>
              <p className="text-muted">Track your college attendance</p>
            </div>

            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Student ID</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                      <Form.Control 
                        type="text" 
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
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
                      />
                    </div>
                  </Form.Group>
                  
                  <Button type="submit" variant="primary" className="w-100 mb-3">
                    <FaSignInAlt className="me-2" />Login
                  </Button>
                </Form>
                
                <div className="text-center">
                  <p className="mb-0">Don't have an account? 
                    <Button variant="link" className="text-primary fw-bold p-0 ms-1" onClick={onShowRegister}>
                      Register here
                    </Button>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
        
        <Col lg={6} className="bg-primary d-none d-lg-flex align-items-center justify-content-center text-white">
          <div className="text-center">
            <FaGraduationCap className="mb-4" style={{ fontSize: '4rem', opacity: 0.8 }} />
            <h3 className="mb-4">Track Your Academic Progress</h3>
            <p className="lead mb-4">Monitor your attendance across all subjects and ensure you maintain the required 75% attendance rate.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 