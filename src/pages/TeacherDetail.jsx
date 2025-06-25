import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Loading from '../components/Common/Loading';
import ApiService from '../services/api';
import { formatDate, formatPhoneNumber } from '../utils/helpers';
import { WEEKDAYS } from '../utils/constants';

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadTeacherDetails();
  }, [id]);

  const loadTeacherDetails = async () => {
    setLoading(true);
    try {
      const [teacherData, assignmentsData, schedulesData] = await Promise.all([
        ApiService.getTeacherDetails(id),
        ApiService.getTeacherAssignedClasses(id).catch(() => []),
        ApiService.getSchedules().then(schedules => 
          schedules.filter(s => s.teacher_id === parseInt(id))
        ).catch(() => [])
      ]);

      setTeacher(teacherData);
      setAssignments(assignmentsData);
      setSchedules(schedulesData);
    } catch (error) {
      setError('O\'qituvchi ma\'lumotlarini yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNumber) => {
    const day = WEEKDAYS.find(d => d.value === dayNumber);
    return day ? day.label : 'Noma\'lum';
  };

  const getTimeSlots = () => {
    const slots = {};
    schedules.forEach(schedule => {
      const day = schedule.day_of_week;
      if (!slots[day]) slots[day] = [];
      slots[day].push({
        time: `${schedule.start_time} - ${schedule.end_time}`,
        subject: schedule.subject_name,
        group: schedule.group_name,
        room: schedule.room || 'Xona ko\'rsatilmagan'
      });
    });
    
    // Sort time slots for each day
    Object.keys(slots).forEach(day => {
      slots[day].sort((a, b) => a.time.localeCompare(b.time));
    });
    
    return slots;
  };

  const getWorkloadStats = () => {
    const uniqueGroups = new Set();
    const uniqueSubjects = new Set();
    let totalHours = 0;

    assignments.forEach(assignment => {
      uniqueGroups.add(assignment.group_id);
      uniqueSubjects.add(assignment.subject_id);
    });

    schedules.forEach(schedule => {
      const start = new Date(`2000-01-01 ${schedule.start_time}`);
      const end = new Date(`2000-01-01 ${schedule.end_time}`);
      totalHours += (end - start) / (1000 * 60 * 60); // Convert to hours
    });

    return {
      groups: uniqueGroups.size,
      subjects: uniqueSubjects.size,
      weeklyHours: totalHours,
      classes: schedules.length
    };
  };

  const tabs = [
    { id: 'overview', label: 'Umumiy ma\'lumot', icon: '📋' },
    { id: 'assignments', label: 'Tayinlovlar', icon: '📚' },
    { id: 'schedule', label: 'Dars jadvali', icon: '📅' }
  ];

  if (loading) return <Loading size="large" text="O'qituvchi ma'lumotlari yuklanmoqda..." />;
  if (error) return <div className="error">{error}</div>;
  if (!teacher) return <div className="error">O'qituvchi topilmadi</div>;

  const workloadStats = getWorkloadStats();
  const timeSlots = getTimeSlots();

  return (
    <div className="teacher-detail">
      {/* Header */}
      <div className="detail-header">
        <Button variant="secondary" onClick={() => navigate('/teachers')}>
          ← Orqaga
        </Button>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            Tahrirlash
          </Button>
          <Button onClick={() => setShowAssignModal(true)}>
            Yangi tayinlov
          </Button>
        </div>
      </div>

      {/* Teacher Profile Card */}
      <Card className="teacher-profile">
        <div className="profile-header">
          <div className="profile-avatar">
            {teacher.profile_picture ? (
              <img src={teacher.profile_picture} alt={teacher.first_name} />
            ) : (
              <div className="avatar-placeholder">
                {teacher.first_name[0]}{teacher.last_name[0]}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{teacher.first_name} {teacher.last_name}</h1>
            <div className="profile-meta">
              <span className={`status ${teacher.is_active ? 'active' : 'inactive'}`}>
                {teacher.is_active ? 'Faol' : 'Nofaol'}
              </span>
              <span className="join-date">
                Qo'shilgan: {formatDate(teacher.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-contact">
          <div className="contact-item">
            <span className="contact-label">Telefon:</span>
            <span className="contact-value">{formatPhoneNumber(teacher.phone)}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <span className="contact-value">{teacher.email || 'Kiritilmagan'}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Manzil:</span>
            <span className="contact-value">{teacher.address || 'Kiritilmagan'}</span>
          </div>
        </div>
      </Card>

      {/* Workload Statistics */}
      <div className="stats-grid">
        <Card className="stat-card groups">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{workloadStats.groups}</div>
            <div className="stat-label">Guruhlar</div>
          </div>
        </Card>
        
        <Card className="stat-card subjects">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{workloadStats.subjects}</div>
            <div className="stat-label">Fanlar</div>
          </div>
        </Card>
        
        <Card className="stat-card hours">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-number">{workloadStats.weeklyHours}h</div>
            <div className="stat-label">Haftalik soatlar</div>
          </div>
        </Card>
        
        <Card className="stat-card classes">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{workloadStats.classes}</div>
            <div className="stat-label">Darslar</div>
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
                    <span>{teacher.first_name} {teacher.last_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Telefon:</label>
                    <span>{formatPhoneNumber(teacher.phone)}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{teacher.email || 'Kiritilmagan'}</span>
                  </div>
                  <div className="info-item">
                    <label>Manzil:</label>
                    <span>{teacher.address || 'Kiritilmagan'}</span>
                  </div>
                  <div className="info-item">
                    <label>Tug'ilgan sana:</label>
                    <span>{teacher.birth_date ? formatDate(teacher.birth_date) : 'Kiritilmagan'}</span>
                  </div>
                  <div className="info-item">
                    <label>Holat:</label>
                    <span className={`status ${teacher.is_active ? 'active' : 'inactive'}`}>
                      {teacher.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3>Ish yuklash xulosasi</h3>
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-title">Guruhlar</div>
                    <div className="summary-value">{workloadStats.groups}</div>
                    <div className="summary-desc">tayinlangan guruhlar</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">Fanlar</div>
                    <div className="summary-value">{workloadStats.subjects}</div>
                    <div className="summary-desc">o'qitiladigan fanlar</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">Soatlar</div>
                    <div className="summary-value">{workloadStats.weeklyHours}</div>
                    <div className="summary-desc">haftalik dars soatlari</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="assignments-content">
              <div className="content-header">
                <h3>Tayinlangan fanlar va guruhlar</h3>
                <Button size="small" onClick={() => setShowAssignModal(true)}>
                  Yangi tayinlov
                </Button>
              </div>

              {assignments.length > 0 ? (
                <div className="assignments-grid">
                  {assignments.map((assignment, index) => (
                    <div key={index} className="assignment-card">
                      <div className="assignment-header">
                        <h4>{assignment.subject_name}</h4>
                        <span className="group-badge">{assignment.group_name}</span>
                      </div>
                      <div className="assignment-details">
                        <div className="detail-item">
                          <span className="detail-label">Guruh:</span>
                          <span className="detail-value">{assignment.group_name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">O'quvchilar:</span>
                          <span className="detail-value">{assignment.students_count || 0} ta</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Tayinlangan:</span>
                          <span className="detail-value">{formatDate(assignment.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">📚</div>
                  <p>Hech qanday tayinlov topilmadi</p>
                  <Button onClick={() => setShowAssignModal(true)}>
                    Birinchi tayinlovni yaratish
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-content">
              <h3>Haftalik dars jadvali</h3>

              {Object.keys(timeSlots).length > 0 ? (
                <div className="schedule-grid">
                  {WEEKDAYS.map(day => (
                    <div key={day.value} className="day-schedule">
                      <div className="day-header">
                        <h4>{day.label}</h4>
                        <span className="day-count">
                          {timeSlots[day.value]?.length || 0} dars
                        </span>
                      </div>
                      
                      <div className="day-classes">
                        {timeSlots[day.value]?.length > 0 ? (
                          timeSlots[day.value].map((slot, index) => (
                            <div key={index} className="class-slot">
                              <div className="slot-time">{slot.time}</div>
                              <div className="slot-subject">{slot.subject}</div>
                              <div className="slot-group">{slot.group}</div>
                              <div className="slot-room">{slot.room}</div>
                            </div>
                          ))
                        ) : (
                          <div className="no-classes">Dars yo'q</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">📅</div>
                  <p>Dars jadvali topilmadi</p>
                  <p>O'qituvchi uchun dars jadvali tuzilmagan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="O'qituvchini tahrirlash"
      >
        <p>O'qituvchi tahrirlash formasi bu yerda bo'ladi</p>
        {/* TeacherForm component will be here */}
      </Modal>

      {/* Assignment Modal */}
      <Modal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Yangi tayinlov"
      >
        <p>Yangi tayinlov formasi bu yerda bo'ladi</p>
        {/* Assignment form will be here */}
      </Modal>
    </div>
  );
};

export default TeacherDetail;