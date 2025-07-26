import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Dropdown, Modal, Form, Alert } from 'react-bootstrap';
import { 
  FaGraduationCap, FaUser, FaSignOutAlt, FaBook, FaPercentage, 
  FaCheckCircle, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, 
  FaCog, FaCheck, FaTimes 
} from 'react-icons/fa';

const Dashboard = ({ user, onLogout }) => {
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [todayMarked, setTodayMarked] = useState({});
  const [stats, setStats] = useState({
    totalSubjects: 0,
    avgAttendance: 0,
    safeSubjects: 0,
    riskSubjects: 0
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  
  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [credits, setCredits] = useState(3);
  const [totalClassesPlanned, setTotalClassesPlanned] = useState('');
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);
  
  // Alert state
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    loadUserData();
    resetDailyMarks();
  }, []);

  useEffect(() => {
    updateStats();
  }, [subjects]);

  const loadUserData = () => {
    if (!user) return;
    
    const userKey = `attendance_${user.studentId}`;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
    
    setSubjects(userData.subjects || []);
    setAttendanceRecords(userData.attendanceRecords || {});
    
    // Load today's marks
    const savedMarks = localStorage.getItem(`todayMarked_${user.studentId}`);
    if (savedMarks) {
      setTodayMarked(JSON.parse(savedMarks));
    }
  };

  const saveUserData = () => {
    if (!user) return;
    
    const userKey = `attendance_${user.studentId}`;
    const userData = {
      subjects,
      attendanceRecords
    };
    
    localStorage.setItem(userKey, JSON.stringify(userData));
    saveTodayMarks();
  };

  // Reset daily marks if it's a new day
  const resetDailyMarks = () => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('lastAttendanceDate');
    
    if (today !== lastDate) {
      // It's a new day, reset the marked flags
      setTodayMarked({});
      localStorage.setItem('lastAttendanceDate', today);
    } else {
      // Load today's marks from localStorage if available
      const savedMarks = localStorage.getItem(`todayMarked_${user?.studentId}`);
      if (savedMarks) {
        setTodayMarked(JSON.parse(savedMarks));
      }
    }
  };

  // Save today's marks to localStorage
  const saveTodayMarks = () => {
    if (user) {
      localStorage.setItem(`todayMarked_${user.studentId}`, JSON.stringify(todayMarked));
    }
  };

  const updateStats = () => {
    let totalPercentage = 0;
    let safeCount = 0;
    let riskCount = 0;

    subjects.forEach(subject => {
      const totalClasses = subject.totalClasses || 0;
      const attendedClasses = subject.attendedClasses || 0;
      const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
      
      totalPercentage += percentage;
      
      const status = getAttendanceStatus(percentage);
      if (status === 'safe') {
        safeCount++;
      } else if (status === 'danger') {
        riskCount++;
      }
    });

    const avgAttendance = subjects.length > 0 ? (totalPercentage / subjects.length) : 0;

    setStats({
      totalSubjects: subjects.length,
      avgAttendance: avgAttendance.toFixed(1),
      safeSubjects: safeCount,
      riskSubjects: riskCount
    });
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return 'safe';
    if (percentage >= 65) return 'warning';
    return 'danger';
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    
    const subject = {
      id: Date.now(),
      name: subjectName,
      code: subjectCode,
      credits: parseInt(credits),
      totalClasses: 0,
      attendedClasses: 0,
      totalClassesPlanned: totalClassesPlanned ? parseInt(totalClassesPlanned) : 0,
      createdAt: new Date().toISOString()
    };

    setSubjects([...subjects, subject]);
    setAttendanceRecords({...attendanceRecords, [subject.id]: {}});
    
    saveUserData();
    setShowAddModal(false);
    resetAddForm();
    showAlertMessage(`Subject "${subjectName}" added successfully!`, 'success');
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    
    if (!currentSubject) return;
    
    const updatedSubjects = subjects.map(s => {
      if (s.id === currentSubject.id) {
        return {
          ...s,
          name: subjectName,
          code: subjectCode,
          credits: parseInt(credits),
          totalClassesPlanned: totalClassesPlanned ? parseInt(totalClassesPlanned) : 0,
          totalClasses: parseInt(totalClasses),
          attendedClasses: parseInt(attendedClasses) > parseInt(totalClasses) ? parseInt(totalClasses) : parseInt(attendedClasses)
        };
      }
      return s;
    });
    
    setSubjects(updatedSubjects);
    saveUserData();
    setShowEditModal(false);
    showAlertMessage(`Subject "${subjectName}" updated successfully!`, 'success');
  };

  const handleDeleteSubject = (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      const updatedSubjects = subjects.filter(s => s.id !== subjectId);
      const updatedRecords = {...attendanceRecords};
      delete updatedRecords[subjectId];
      
      const updatedTodayMarked = {...todayMarked};
      delete updatedTodayMarked[subjectId];
      
      setSubjects(updatedSubjects);
      setAttendanceRecords(updatedRecords);
      setTodayMarked(updatedTodayMarked);
      
      saveUserData();
      showAlertMessage('Subject deleted successfully!', 'success');
    }
  };

  const openEditModal = (subject) => {
    setCurrentSubject(subject);
    setSubjectName(subject.name);
    setSubjectCode(subject.code);
    setCredits(subject.credits);
    setTotalClassesPlanned(subject.totalClassesPlanned || '');
    setTotalClasses(subject.totalClasses || 0);
    setAttendedClasses(subject.attendedClasses || 0);
    setShowEditModal(true);
  };

  const openAttendanceModal = (subject) => {
    setCurrentSubject(subject);
    setShowAttendanceModal(true);
  };

  const markAttendance = (isPresent) => {
    if (!currentSubject) return;

    // Check if attendance has already been marked today for this subject
    if (todayMarked[currentSubject.id]) {
      showAlertMessage('Attendance already marked for today!', 'warning');
      return;
    }

    // Check if we've reached the planned number of classes
    if (currentSubject.totalClassesPlanned > 0 && currentSubject.totalClasses >= currentSubject.totalClassesPlanned) {
      showAlertMessage(`You've reached the planned number of classes (${currentSubject.totalClassesPlanned})!`, 'warning');
      return;
    }

    const updatedSubjects = subjects.map(s => {
      if (s.id === currentSubject.id) {
        if (isPresent) {
          return {
            ...s,
            totalClasses: (s.totalClasses || 0) + 1,
            attendedClasses: (s.attendedClasses || 0) + 1
          };
        } else {
          return {
            ...s,
            totalClasses: (s.totalClasses || 0) + 1
          };
        }
      }
      return s;
    });

    // Mark attendance as recorded for today
    setTodayMarked({...todayMarked, [currentSubject.id]: true});
    setSubjects(updatedSubjects);
    
    saveUserData();
    setShowAttendanceModal(false);
    
    const status = isPresent ? 'Present' : 'Absent';
    showAlertMessage(`Marked ${status} for today`, 'success');
  };

  const resetAddForm = () => {
    setSubjectName('');
    setSubjectCode('');
    setCredits(3);
    setTotalClassesPlanned('');
  };

  const showAlertMessage = (message, variant) => {
    setAlert({ show: true, message, variant });
    setTimeout(() => {
      setAlert({ ...alert, show: false });
    }, 3000);
  };

  return (
    <>
      {/* Navigation */}
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">
            <FaGraduationCap className="me-2" />
            Attendance Tracker
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav" className="justify-content-end">
            <Nav>
              <Dropdown>
                <Dropdown.Toggle variant="link" className="text-white nav-link">
                  <FaUser className="me-2" />{user.name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={onLogout}>
                    <FaSignOutAlt className="me-2" />Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="mt-4">
        {/* Alert Container */}
        {alert.show && (
          <Alert variant={alert.variant} onClose={() => setAlert({...alert, show: false})} dismissible>
            {alert.message}
          </Alert>
        )}

        {/* Header Section */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-0">Welcome, {user.name}!</h1>
                <p className="text-muted">Track and maintain your 75% attendance requirement</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>
                <FaPlus className="me-2" />Add Subject
              </Button>
            </div>
          </Col>
        </Row>

        {/* Overall Stats */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="bg-light">
              <Card.Body className="text-center">
                <FaBook className="text-primary mb-2" style={{ fontSize: '2rem' }} />
                <h5 className="card-title">Total Subjects</h5>
                <h3 className="text-primary">{stats.totalSubjects}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="bg-light">
              <Card.Body className="text-center">
                <FaPercentage className="text-success mb-2" style={{ fontSize: '2rem' }} />
                <h5 className="card-title">Average Attendance</h5>
                <h3 className="text-success">{stats.avgAttendance}%</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="bg-light">
              <Card.Body className="text-center">
                <FaCheckCircle className="text-success mb-2" style={{ fontSize: '2rem' }} />
                <h5 className="card-title">Safe Subjects</h5>
                <h3 className="text-success">{stats.safeSubjects}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="bg-light">
              <Card.Body className="text-center">
                <FaExclamationTriangle className="text-danger mb-2" style={{ fontSize: '2rem' }} />
                <h5 className="card-title">At Risk</h5>
                <h3 className="text-danger">{stats.riskSubjects}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Subjects Grid */}
        <Row>
          {subjects.length > 0 ? (
            subjects.map(subject => {
              const totalClasses = subject.totalClasses || 0;
              const attendedClasses = subject.attendedClasses || 0;
              const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
              const status = getAttendanceStatus(percentage);
              const classesNeededFor75 = Math.max(0, Math.ceil(totalClasses * 0.75) - attendedClasses);

              return (
                <Col lg={4} md={6} className="mb-4" key={subject.id}>
                  <Card className={`subject-card status-${status}`}>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-0">{subject.name}</h5>
                        <small className="opacity-75">{subject.code} ({subject.credits} credits)</small>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Row className="mb-3 text-center">
                        <Col xs={3}>
                          <div className="h6 mb-0 text-primary">{totalClasses}</div>
                          <small className="text-muted">Held</small>
                        </Col>
                        <Col xs={3}>
                          <div className="h6 mb-0 text-success">{attendedClasses}</div>
                          <small className="text-muted">Present</small>
                        </Col>
                        <Col xs={3}>
                          <div className="h6 mb-0 text-danger">{totalClasses - attendedClasses}</div>
                          <small className="text-muted">Absent</small>
                        </Col>
                        <Col xs={3}>
                          <div className="h6 mb-0 text-info">{subject.totalClassesPlanned || 'N/A'}</div>
                          <small className="text-muted">Planned</small>
                        </Col>
                      </Row>
                      
                      {subject.totalClassesPlanned > 0 && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Progress</span>
                            <span>{totalClasses}/{subject.totalClassesPlanned} classes</span>
                          </div>
                          <div className="progress mb-2" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${Math.min((totalClasses / subject.totalClassesPlanned) * 100, 100)}%` }}
                            ></div>
                          </div>
                          {totalClasses > subject.totalClassesPlanned && (
                            <small className="text-warning">
                              <FaExclamationTriangle className="me-1" />
                              Exceeded planned number of classes
                            </small>
                          )}
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Attendance</span>
                          <span className="fw-bold">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="progress">
                          <div 
                            className={`progress-bar bg-${status === 'safe' ? 'success' : status === 'warning' ? 'warning' : 'danger'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className={`badge status-badge status-${status}`}>
                          {status === 'safe' ? '✓ Safe (≥75%)' : status === 'warning' ? '⚠ Warning (65-74%)' : '⚠ At Risk (<65%)'}
                        </span>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted">
                          {classesNeededFor75 > 0 
                            ? `Attend ${classesNeededFor75} more to reach 75%`
                            : percentage >= 75 
                              ? '✓ Target achieved!'
                              : totalClasses === 0 
                                ? 'Start marking attendance'
                                : 'Keep attending classes'
                          }
                        </small>
                      </div>

                      <div className="d-flex gap-2">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-fill"
                          onClick={() => openAttendanceModal(subject)}
                        >
                          <FaEdit className="me-1" />Mark Today
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => openEditModal(subject)}
                          title="Edit Subject Details"
                        >
                          <FaCog />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteSubject(subject.id)}
                          title="Delete Subject"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col xs={12}>
              <div id="emptyState" className="text-center py-5">
                <FaBook className="text-muted mb-3" style={{ fontSize: '4rem' }} />
                <h3 className="text-muted">No Subjects Added Yet</h3>
                <p className="text-muted mb-4">Start by adding your first subject to track attendance</p>
                <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>
                  <FaPlus className="me-2" />Add Your First Subject
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Container>

      {/* Add Subject Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Subject</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubject}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control 
                type="text" 
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Code</Form.Label>
              <Form.Control 
                type="text" 
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                required
              />
              <Form.Text className="text-muted">e.g., CS101, MATH201</Form.Text>
            </Form.Group>
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Credits</Form.Label>
                  <Form.Select 
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    required
                  >
                    <option value="1">1 Credit</option>
                    <option value="2">2 Credits</option>
                    <option value="3">3 Credits</option>
                    <option value="4">4 Credits</option>
                    <option value="5">5 Credits</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Total Classes Planned</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1"
                    placeholder="e.g., 60"
                    value={totalClassesPlanned}
                    onChange={(e) => setTotalClassesPlanned(e.target.value)}
                  />
                  <Form.Text className="text-muted">Optional</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Subject
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Subject Details</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubject}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control 
                type="text" 
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject Code</Form.Label>
              <Form.Control 
                type="text" 
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                required
              />
            </Form.Group>
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Credits</Form.Label>
                  <Form.Select 
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    required
                  >
                    <option value="1">1 Credit</option>
                    <option value="2">2 Credits</option>
                    <option value="3">3 Credits</option>
                    <option value="4">4 Credits</option>
                    <option value="5">5 Credits</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Total Classes Planned</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1"
                    placeholder="e.g., 60"
                    value={totalClassesPlanned}
                    onChange={(e) => setTotalClassesPlanned(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Classes Held So Far</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(e.target.value)}
                  />
                  <Form.Text className="text-muted">Total classes that have been conducted</Form.Text>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Classes Attended</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0"
                    value={attendedClasses}
                    onChange={(e) => setAttendedClasses(e.target.value)}
                  />
                  <Form.Text className="text-muted">Classes you were present for</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Mark Attendance Modal */}
      <Modal show={showAttendanceModal} onHide={() => setShowAttendanceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentSubject?.name} - Mark Today's Attendance
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSubject && (
            <div className="text-center">
              <div className="text-center mb-4">
                <h5>Today: {new Date().toLocaleDateString()}</h5>
                <p className="text-muted">Was there a class today? Mark your attendance:</p>
              </div>
              
              {todayMarked[currentSubject.id] ? (
                <Alert variant="info">
                  <FaCheck className="me-2" />
                  You've already marked attendance for this subject today.
                </Alert>
              ) : currentSubject.totalClassesPlanned > 0 && currentSubject.totalClasses >= currentSubject.totalClassesPlanned ? (
                <Alert variant="warning">
                  <FaExclamationTriangle className="me-2" />
                  You've reached the planned number of classes ({currentSubject.totalClassesPlanned}).
                </Alert>
              ) : (
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <Button variant="success" size="lg" onClick={() => markAttendance(true)}>
                    <FaCheck className="me-2" />Present
                  </Button>
                  <Button variant="danger" size="lg" onClick={() => markAttendance(false)}>
                    <FaTimes className="me-2" />Absent
                  </Button>
                </div>
              )}

              <Row className="g-3 mt-3">
                <Col xs={6}>
                  <div className="text-center p-2 bg-light rounded">
                    <h6 className="text-primary mb-0">{currentSubject.totalClasses || 0}</h6>
                    <small className="text-muted">Total Classes</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-2 bg-light rounded">
                    <h6 className="text-success mb-0">{currentSubject.attendedClasses || 0}</h6>
                    <small className="text-muted">Attended</small>
                  </div>
                </Col>
              </Row>
              
              {(() => {
                const totalClasses = currentSubject.totalClasses || 0;
                const attendedClasses = currentSubject.attendedClasses || 0;
                const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
                const classesNeededFor75 = Math.max(0, Math.ceil(totalClasses * 0.75) - attendedClasses);
                
                return (
                  <div className="mt-3 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Current: {percentage.toFixed(1)}%</span>
                      <small className="text-muted">
                        {classesNeededFor75 > 0 
                          ? `Need ${classesNeededFor75} more to reach 75%`
                          : '✓ Target achieved!'
                        }
                      </small>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;
