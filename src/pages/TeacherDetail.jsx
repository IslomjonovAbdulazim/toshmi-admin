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
        ApiService.getTeacherAssignedClasses(id),
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
    return day ? day.label : '-';
  };

  const getWeeklySchedule = () => {
    const weeklySchedule = {};
    WEEKDAYS.forEach(day => {
      weeklySchedule[day.value] = schedules.filter(s => s.day === day.value)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return weeklySchedule;
  };

  const getTotalWeeklyHours = () => {
    return schedules.length * 1; // Assuming each class is 1 hour
  };

  const getUniqueSubjects = () => {
    const subjects = new Set();
    assignments.forEach(assignment => {
      if (assignment.subject?.name) {
        subjects.add(assignment.subject.name);
      }
    });
    return Array.from(subjects);
  };

  const getUniqueGroups = () => {
    const groups = new Set();
    assignments.forEach(assignment => {
      if (assignment.group?.name) {
        groups.add(assignment.group.name);
      }
    });
    return Array.from(groups);
  };

  const tabs = [
    { id: 'overview', label: 'Umumiy ma\'lumot', icon: '📋' },
    { id: 'assignments', label: 'Tayinlangan fanlar', icon: '📚' },
    { id: 'schedule', label: 'Dars jadvali', icon: '📅' },
    { id: 'performance', label: 'Statistika', icon: '📊' }
  ];

  if (loading) return <Loading size="large" text="O'qituvchi ma'lumotlari yuklanmoqda..." />;
  if (error) return <div className="error">{error}</div>;
  if (!teacher) return <div className="error">O'qituvchi topilmadi</div>;

  const weeklySchedule = getWeeklySchedule();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button 
            onClick={() => navigate('/teachers')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center"
          >
            ← O'qituvchilar ro'yxatiga qaytish
          </button>
          <h1 className="header-title">
            {teacher.first_name} {teacher.last_name}
          </h1>
          <p className="text-gray-600">
            O'qituvchi • ID: {teacher.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAssignModal(true)}>
            Fan tayinlash
          </Button>
          <Button onClick={() => setShowEditModal(true)}>
            Tahrirlash
          </Button>
          <Button 
            variant="secondary"
            onClick={() => window.print()}
          >
            📄 Chop etish
          </Button>
        </div>
      </div>

      {/* Teacher Overview Card */}
      <Card className="mb-6">
        <div className="grid grid-3 gap-6">
          {/* Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              {teacher.profile_image_id ? (
                <img 
                  src={`/files/${teacher.profile_image_id}`} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-green-600">
                  {teacher.first_name?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {teacher.first_name} {teacher.last_name}
              </h3>
              <p className="text-gray-600">{teacher.specialization || 'Mutaxassislik ko\'rsatilmagan'}</p>
              <span className={`badge ${teacher.is_active ? 'badge-success' : 'badge-danger'}`}>
                {teacher.is_active ? 'Faol' : 'Faol emas'}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium mb-2">Aloqa ma'lumotlari</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-600">Telefon:</span>
                <span className="ml-2">
                  {teacher.phone ? formatPhoneNumber(teacher.phone) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2">{teacher.email || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Qo'shilgan:</span>
                <span className="ml-2">{formatDate(teacher.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Work Info */}
          <div>
            <h4 className="font-medium mb-2">Ish ma'lumotlari</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-600">Fanlar soni:</span>
                <span className="ml-2 font-medium">{getUniqueSubjects().length}</span>
              </div>
              <div>
                <span className="text-gray-600">Sinflar soni:</span>
                <span className="ml-2 font-medium">{getUniqueGroups().length}</span>
              </div>
              <div>
                <span className="text-gray-600">Haftalik darslar:</span>
                <span className="ml-2 font-medium">{getTotalWeeklyHours()} soat</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-number text-blue-600">{assignments.length}</div>
          <div className="stat-label">Jami tayinlashlar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-green-600">{getUniqueSubjects().length}</div>
          <div className="stat-label">Fanlar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-purple-600">{getUniqueGroups().length}</div>
          <div className="stat-label">Sinflar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-orange-600">{getTotalWeeklyHours()}</div>
          <div className="stat-label">Haftalik soatlar</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-2 gap-6">
          <Card title="Tayinlangan fanlar">
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{assignment.subject?.name}</div>
                      <div className="text-sm text-gray-600">
                        {assignment.group?.name} • {assignment.group?.academic_year}
                      </div>
                    </div>
                    <span className="badge">{assignment.subject?.code}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📚</div>
                <p>Hali fanlar tayinlanmagan</p>
              </div>
            )}
          </Card>

          <Card title="Bugungi darslar">
            {(() => {
              const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Convert to our format
              const todayClasses = weeklySchedule[today] || [];
              
              return todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium">{schedule.subject?.name}</div>
                        <div className="text-sm text-gray-600">
                          {schedule.group?.name} • {schedule.room || 'Xona ko\'rsatilmagan'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p>Bugun darslar yo'q</p>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {activeTab === 'assignments' && (
        <Card title="Barcha tayinlashlar">
          {assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fan</th>
                    <th>Fan kodi</th>
                    <th>Sinf</th>
                    <th>O'quv yili</th>
                    <th>Tayinlangan sana</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment, index) => (
                    <tr key={index}>
                      <td className="font-medium">{assignment.subject?.name}</td>
                      <td>
                        <span className="badge">{assignment.subject?.code}</span>
                      </td>
                      <td>{assignment.group?.name}</td>
                      <td>{assignment.group?.academic_year}</td>
                      <td>{formatDate(assignment.created_at)}</td>
                      <td>
                        <Button size="sm" variant="danger">
                          Bekor qilish
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📚</div>
              <p>Hali fanlar tayinlanmagan</p>
              <Button className="mt-4" onClick={() => setShowAssignModal(true)}>
                Fan tayinlash
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'schedule' && (
        <Card title="Haftalik dars jadvali">
          {schedules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kun</th>
                    <th>Vaqt</th>
                    <th>Fan</th>
                    <th>Sinf</th>
                    <th>Xona</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAYS.map(day => {
                    const dayClasses = weeklySchedule[day.value] || [];
                    return dayClasses.length > 0 ? (
                      dayClasses.map((schedule, index) => (
                        <tr key={`${day.value}-${index}`}>
                          <td>
                            {index === 0 && (
                              <span className="font-medium">{day.label}</span>
                            )}
                          </td>
                          <td>{schedule.start_time} - {schedule.end_time}</td>
                          <td className="font-medium">{schedule.subject?.name}</td>
                          <td>{schedule.group?.name}</td>
                          <td>{schedule.room || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr key={day.value}>
                        <td>
                          <span className="font-medium text-gray-400">{day.label}</span>
                        </td>
                        <td colSpan="4" className="text-gray-400 text-center">
                          Darslar yo'q
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📅</div>
              <p>Dars jadvali tuzilmagan</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-2 gap-6">
          <Card title="Ish yuklash statistikasi">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jami tayinlashlar:</span>
                <span className="font-bold text-lg">{assignments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fanlar soni:</span>
                <span className="font-bold text-lg">{getUniqueSubjects().length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sinflar soni:</span>
                <span className="font-bold text-lg">{getUniqueGroups().length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Haftalik darslar:</span>
                <span className="font-bold text-lg">{getTotalWeeklyHours()} soat</span>
              </div>
            </div>
          </Card>

          <Card title="Fanlar bo'yicha taqsimot">
            {getUniqueSubjects().length > 0 ? (
              <div className="space-y-3">
                {getUniqueSubjects().map((subject, index) => {
                  const subjectAssignments = assignments.filter(a => a.subject?.name === subject);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">{subject}</span>
                      <span className="badge badge-success">
                        {subjectAssignments.length} sinf
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Ma'lumotlar yo'q</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modals */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="O'qituvchini tahrirlash"
      >
        <p>O'qituvchi tahrirlash funksiyasi bu yerda bo'ladi...</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Bekor qilish
          </Button>
          <Button onClick={() => setShowEditModal(false)}>
            Saqlash
          </Button>
        </div>
      </Modal>

      <Modal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Fan tayinlash"
      >
        <p>Fan tayinlash funksiyasi bu yerda bo'ladi...</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Bekor qilish
          </Button>
          <Button onClick={() => setShowAssignModal(false)}>
            Tayinlash
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherDetail;