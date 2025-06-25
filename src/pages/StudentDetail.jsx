import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Loading from '../components/Common/Loading';
import ApiService from '../services/api';
import { formatDate, formatPhoneNumber, calculateGrade, getGradeColor, getGradeLetter } from '../utils/helpers';
import { ATTENDANCE_STATUS_LABELS } from '../utils/constants';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadStudentDetails = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getStudentDetails(id);
        setStudent(data);
      } catch (error) {
        setError('O\'quvchi ma\'lumotlarini yuklashda xatolik: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudentDetails();
  }, [id]); // Only depend on id

  const calculateGradeStats = (grades) => {
    if (!grades || grades.length === 0) return { average: 0, total: 0, passed: 0 };
    
    const validGrades = grades.filter(g => g.points !== null && g.max_points > 0);
    if (validGrades.length === 0) return { average: 0, total: 0, passed: 0 };
    
    const totalPercentage = validGrades.reduce((sum, grade) => 
      sum + calculateGrade(grade.points, grade.max_points), 0
    );
    
    const average = totalPercentage / validGrades.length;
    const passed = validGrades.filter(g => calculateGrade(g.points, g.max_points) >= 60).length;
    
    return {
      average: Math.round(average),
      total: validGrades.length,
      passed
    };
  };

  const getAttendanceStats = (attendance) => {
    if (!attendance || attendance.length === 0) return { total: 0, present: 0, absent: 0, late: 0 };
    
    const stats = attendance.reduce((acc, record) => {
      acc.total++;
      if (record.status === 'present') acc.present++;
      else if (record.status === 'absent') acc.absent++;
      else if (record.status === 'late') acc.late++;
      return acc;
    }, { total: 0, present: 0, absent: 0, late: 0 });
    
    return stats;
  };

  const tabs = [
    { id: 'overview', label: 'Umumiy ma\'lumot', icon: '📋' },
    { id: 'grades', label: 'Baholar', icon: '📊' },
    { id: 'attendance', label: 'Davomat', icon: '👥' },
    { id: 'payments', label: 'To\'lovlar', icon: '💰' }
  ];

  if (loading) return <Loading size="large" text="O'quvchi ma'lumotlari yuklanmoqda..." />;
  if (error) return <div className="error">{error}</div>;
  if (!student) return <div className="error">O'quvchi topilmadi</div>;

  const homeworkStats = calculateGradeStats(student.homework_grades || []);
  const examStats = calculateGradeStats(student.exam_grades || []);
  const attendanceStats = getAttendanceStats(student.attendance_records || []);

  return (
    <div className="student-detail">
      {/* Header */}
      <div className="detail-header">
        <Button variant="secondary" onClick={() => navigate('/students')}>
          ← Orqaga
        </Button>
        <Button onClick={() => setShowEditModal(true)}>
          Tahrirlash
        </Button>
      </div>

      {/* Student Profile Card */}
      <Card className="student-profile">
        <div className="profile-header">
          <div className="profile-avatar">
            {student.profile_picture ? (
              <img src={student.profile_picture} alt={student.first_name} />
            ) : (
              <div className="avatar-placeholder">
                {student.first_name[0]}{student.last_name[0]}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{student.first_name} {student.last_name}</h1>
            <div className="profile-meta">
              <span className="student-id">ID: {student.id}</span>
              <span className="group-name">{student.group?.name || 'Guruh tayinlanmagan'}</span>
              <span className={`status ${student.is_active ? 'active' : 'inactive'}`}>
                {student.is_active ? 'Faol' : 'Nofaol'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="profile-contact">
          <div className="contact-item">
            <span className="contact-label">Telefon:</span>
            <span className="contact-value">{formatPhoneNumber(student.phone)}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Ota-ona telefoni:</span>
            <span className="contact-value">{formatPhoneNumber(student.parent_phone)}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Bitirish yili:</span>
            <span className="contact-value">{student.graduation_year || 'Kiritilmagan'}</span>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <Card className="stat-card homework">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{homeworkStats.average}%</div>
            <div className="stat-label">Uy vazifasi o'rtachasi</div>
            <div className="stat-meta">{homeworkStats.passed}/{homeworkStats.total} bajarilgan</div>
          </div>
        </Card>
        
        <Card className="stat-card exams">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{examStats.average}%</div>
            <div className="stat-label">Imtihon o'rtachasi</div>
            <div className="stat-meta">{examStats.passed}/{examStats.total} topshirilgan</div>
          </div>
        </Card>
        
        <Card className="stat-card attendance">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">
              {attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%
            </div>
            <div className="stat-label">Davomat</div>
            <div className="stat-meta">{attendanceStats.present}/{attendanceStats.total} kelgan</div>
          </div>
        </Card>
        
        <Card className="stat-card payments">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{(student.payment_records || []).length}</div>
            <div className="stat-label">To'lovlar</div>
            <div className="stat-meta">Jami to'lovlar soni</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="tabs-header">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="info-section">
                <h3>Shaxsiy ma'lumotlar</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>To'liq ismi:</label>
                    <span>{student.first_name} {student.last_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Telefon:</label>
                    <span>{formatPhoneNumber(student.phone)}</span>
                  </div>
                  <div className="info-item">
                    <label>Guruh:</label>
                    <span>{student.group?.name || 'Tayinlanmagan'}</span>
                  </div>
                  <div className="info-item">
                    <label>Ota-ona telefoni:</label>
                    <span>{formatPhoneNumber(student.parent_phone)}</span>
                  </div>
                  <div className="info-item">
                    <label>Bitirish yili:</label>
                    <span>{student.graduation_year || 'Kiritilmagan'}</span>
                  </div>
                  <div className="info-item">
                    <label>Qo'shilgan sana:</label>
                    <span>{formatDate(student.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3>Akademik xulosasi</h3>
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-title">Uy vazifasi</div>
                    <div className="summary-value">{homeworkStats.average}%</div>
                    <div className="summary-desc">{homeworkStats.total} ta topshiriq</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">Imtihonlar</div>
                    <div className="summary-value">{examStats.average}%</div>
                    <div className="summary-desc">{examStats.total} ta imtihon</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">Davomat</div>
                    <div className="summary-value">
                      {attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%
                    </div>
                    <div className="summary-desc">{attendanceStats.total} ta dars</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="grades-content">
              <div className="grades-section">
                <h3>Uy vazifasi baholari</h3>
                {student.homework_grades && student.homework_grades.length > 0 ? (
                  <div className="grades-table">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Topshiriq</th>
                          <th>Ball</th>
                          <th>Foiz</th>
                          <th>Harfi</th>
                          <th>Sana</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.homework_grades.map((grade, index) => {
                          const percentage = calculateGrade(grade.points, grade.max_points);
                          return (
                            <tr key={index}>
                              <td>{grade.homework_title || `Topshiriq ${index + 1}`}</td>
                              <td>{grade.points}/{grade.max_points}</td>
                              <td>
                                <span className={`grade-percentage ${getGradeColor(percentage)}`}>
                                  {percentage}%
                                </span>
                              </td>
                              <td>
                                <span className={`grade-letter ${getGradeColor(percentage)}`}>
                                  {getGradeLetter(percentage)}
                                </span>
                              </td>
                              <td>{formatDate(grade.graded_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📝</div>
                    <p>Uy vazifasi baholari yo'q</p>
                  </div>
                )}
              </div>

              <div className="grades-section">
                <h3>Imtihon baholari</h3>
                {student.exam_grades && student.exam_grades.length > 0 ? (
                  <div className="grades-table">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Imtihon</th>
                          <th>Ball</th>
                          <th>Foiz</th>
                          <th>Harfi</th>
                          <th>Sana</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.exam_grades.map((grade, index) => {
                          const percentage = calculateGrade(grade.points, grade.max_points);
                          return (
                            <tr key={index}>
                              <td>{grade.exam_title || `Imtihon ${index + 1}`}</td>
                              <td>{grade.points}/{grade.max_points}</td>
                              <td>
                                <span className={`grade-percentage ${getGradeColor(percentage)}`}>
                                  {percentage}%
                                </span>
                              </td>
                              <td>
                                <span className={`grade-letter ${getGradeColor(percentage)}`}>
                                  {getGradeLetter(percentage)}
                                </span>
                              </td>
                              <td>{formatDate(grade.graded_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📊</div>
                    <p>Imtihon baholari yo'q</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <Card>
              <h3>Davomat yozuvlari</h3>
              {student.attendance_records && student.attendance_records.length > 0 ? (
                <div className="attendance-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sana</th>
                        <th>Fan</th>
                        <th>Holat</th>
                        <th>Izoh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.attendance_records.map((record, index) => (
                        <tr key={index}>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.subject_name || '-'}</td>
                          <td>
                            <span className={`attendance-status ${record.status}`}>
                              {ATTENDANCE_STATUS_LABELS[record.status] || record.status}
                            </span>
                          </td>
                          <td>{record.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">👥</div>
                  <p>Davomat yozuvlari yo'q</p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card>
              <h3>To'lov tarixi</h3>
              {student.payment_records && student.payment_records.length > 0 ? (
                <div className="payments-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sana</th>
                        <th>Miqdor</th>
                        <th>Usul</th>
                        <th>Izoh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.payment_records.map((payment, index) => (
                        <tr key={index}>
                          <td>{formatDate(payment.payment_date)}</td>
                          <td className="payment-amount">
                            {payment.amount?.toLocaleString()} so'm
                          </td>
                          <td>{payment.payment_method}</td>
                          <td>{payment.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">💰</div>
                  <p>To'lov ma'lumotlari yo'q</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="O'quvchini tahrirlash"
      >
        <p>O'quvchi tahrirlash formasi bu yerda bo'ladi</p>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Bekor qilish
          </Button>
          <Button onClick={() => setShowEditModal(false)}>
            Saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDetail;