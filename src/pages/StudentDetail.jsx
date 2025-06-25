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
    loadStudentDetails();
  }, [id]);

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

  const homeworkStats = calculateGradeStats(student.recent_grades?.homework_grades);
  const examStats = calculateGradeStats(student.recent_grades?.exam_grades);
  const attendanceStats = getAttendanceStats(student.attendance_summary);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button 
            onClick={() => navigate('/students')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center"
          >
            ← O'quvchilar ro'yxatiga qaytish
          </button>
          <h1 className="header-title">
            {student.user?.first_name} {student.user?.last_name}
          </h1>
          <p className="text-gray-600">
            {student.group?.name || 'Sinf tayinlanmagan'} • ID: {student.id}
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Student Overview Card */}
      <Card className="mb-6">
        <div className="grid grid-3 gap-6">
          {/* Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              {student.user?.profile_image_id ? (
                <img 
                  src={`/files/${student.user.profile_image_id}`} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600">
                  {student.user?.first_name?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {student.user?.first_name} {student.user?.last_name}
              </h3>
              <p className="text-gray-600">{student.group?.name}</p>
              <span className={`badge ${student.user?.is_active ? 'badge-success' : 'badge-danger'}`}>
                {student.user?.is_active ? 'Faol' : 'Faol emas'}
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
                  {student.user?.phone ? formatPhoneNumber(student.user.phone) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Ota-ona:</span>
                <span className="ml-2">
                  {student.parent_phone ? formatPhoneNumber(student.parent_phone) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Qo'shilgan:</span>
                <span className="ml-2">{formatDate(student.user?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="font-medium mb-2">Ta'lim ma'lumotlari</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-600">O'quv yili:</span>
                <span className="ml-2">{student.group?.academic_year || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Bitirish yili:</span>
                <span className="ml-2">{student.graduation_year || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">O'rtacha ball:</span>
                <span className="ml-2 font-medium" style={{ color: getGradeColor(homeworkStats.average) }}>
                  {homeworkStats.average}% ({getGradeLetter(homeworkStats.average)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-number" style={{ color: getGradeColor(homeworkStats.average) }}>
            {homeworkStats.average}%
          </div>
          <div className="stat-label">O'rtacha ball</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-blue-600">{homeworkStats.total + examStats.total}</div>
          <div className="stat-label">Jami baholar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-green-600">
            {attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%
          </div>
          <div className="stat-label">Davomat</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-purple-600">{attendanceStats.total}</div>
          <div className="stat-label">Jami darslar</div>
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
          <Card title="Yaqinda qo'yilgan baholar">
            {student.recent_grades?.homework_grades?.length > 0 || student.recent_grades?.exam_grades?.length > 0 ? (
              <div className="space-y-3">
                {/* Recent homework grades */}
                {student.recent_grades?.homework_grades?.slice(0, 5).map((grade, index) => (
                  <div key={`hw-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{grade.homework?.title}</div>
                      <div className="text-sm text-gray-600">{grade.homework?.subject} • Vazifa</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" style={{ color: getGradeColor(calculateGrade(grade.points, grade.homework?.max_points)) }}>
                        {grade.points}/{grade.homework?.max_points}
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(grade.graded_at)}</div>
                    </div>
                  </div>
                ))}
                
                {/* Recent exam grades */}
                {student.recent_grades?.exam_grades?.slice(0, 5).map((grade, index) => (
                  <div key={`ex-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div>
                      <div className="font-medium">{grade.exam?.title}</div>
                      <div className="text-sm text-gray-600">{grade.exam?.subject} • Imtihon</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" style={{ color: getGradeColor(calculateGrade(grade.points, grade.exam?.max_points)) }}>
                        {grade.points}/{grade.exam?.max_points}
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(grade.graded_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📝</div>
                <p>Hali baholar berilmagan</p>
              </div>
            )}
          </Card>

          <Card title="Yaqinda davomat">
            {student.attendance_summary?.length > 0 ? (
              <div className="space-y-2">
                {student.attendance_summary.slice(0, 10).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{record.subject}</div>
                      <div className="text-sm text-gray-600">{formatDate(record.date)}</div>
                    </div>
                    <span className={`badge ${
                      record.status === 'present' ? 'badge-success' :
                      record.status === 'absent' ? 'badge-danger' :
                      record.status === 'late' ? 'badge-warning' : ''
                    }`}>
                      {ATTENDANCE_STATUS_LABELS[record.status] || record.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">👥</div>
                <p>Davomat ma'lumotlari yo'q</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="space-y-6">
          <Card title="Uy vazifasi baholari">
            {student.recent_grades?.homework_grades?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vazifa nomi</th>
                      <th>Fan</th>
                      <th>Ball</th>
                      <th>Foiz</th>
                      <th>Harf</th>
                      <th>Izoh</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.recent_grades.homework_grades.map((grade, index) => {
                      const percentage = calculateGrade(grade.points, grade.homework?.max_points);
                      return (
                        <tr key={index}>
                          <td className="font-medium">{grade.homework?.title}</td>
                          <td>{grade.homework?.subject}</td>
                          <td>{grade.points}/{grade.homework?.max_points}</td>
                          <td style={{ color: getGradeColor(percentage) }}>
                            {percentage}%
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: getGradeColor(percentage), color: 'white' }}>
                              {getGradeLetter(percentage)}
                            </span>
                          </td>
                          <td className="max-w-xs truncate">{grade.comment || '-'}</td>
                          <td>{formatDate(grade.graded_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Uy vazifasi baholari yo'q</p>
              </div>
            )}
          </Card>

          <Card title="Imtihon baholari">
            {student.recent_grades?.exam_grades?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Imtihon nomi</th>
                      <th>Fan</th>
                      <th>Ball</th>
                      <th>Foiz</th>
                      <th>Harf</th>
                      <th>Izoh</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.recent_grades.exam_grades.map((grade, index) => {
                      const percentage = calculateGrade(grade.points, grade.exam?.max_points);
                      return (
                        <tr key={index}>
                          <td className="font-medium">{grade.exam?.title}</td>
                          <td>{grade.exam?.subject}</td>
                          <td>{grade.points}/{grade.exam?.max_points}</td>
                          <td style={{ color: getGradeColor(percentage) }}>
                            {percentage}%
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: getGradeColor(percentage), color: 'white' }}>
                              {getGradeLetter(percentage)}
                            </span>
                          </td>
                          <td className="max-w-xs truncate">{grade.comment || '-'}</td>
                          <td>{formatDate(grade.graded_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Imtihon baholari yo'q</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card title="Davomat jadvali">
          {student.attendance_summary?.length > 0 ? (
            <div>
              <div className="grid grid-4 gap-4 mb-6">
                <div className="stat-card">
                  <div className="stat-number text-green-600">{attendanceStats.present}</div>
                  <div className="stat-label">Kelgan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number text-red-600">{attendanceStats.absent}</div>
                  <div className="stat-label">Kelmagan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number text-yellow-600">{attendanceStats.late}</div>
                  <div className="stat-label">Kech kelgan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number text-blue-600">
                    {attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%
                  </div>
                  <div className="stat-label">Davomat foizi</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sana</th>
                      <th>Fan</th>
                      <th>O'qituvchi</th>
                      <th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.attendance_summary.map((record, index) => (
                      <tr key={index}>
                        <td>{formatDate(record.date)}</td>
                        <td>{record.subject}</td>
                        <td>{record.teacher}</td>
                        <td>
                          <span className={`badge ${
                            record.status === 'present' ? 'badge-success' :
                            record.status === 'absent' ? 'badge-danger' :
                            record.status === 'late' ? 'badge-warning' : ''
                          }`}>
                            {ATTENDANCE_STATUS_LABELS[record.status] || record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">👥</div>
              <p>Davomat ma'lumotlari yo'q</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card title="To'lov tarixi">
          {student.payment_records?.length > 0 ? (
            <div className="overflow-x-auto">
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
                      <td className="font-medium text-green-600">
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
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💰</div>
              <p>To'lov ma'lumotlari yo'q</p>
            </div>
          )}
        </Card>
      )}

      {/* Edit Modal would go here - simplified for this example */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="O'quvchini tahrirlash"
      >
        <p>O'quvchi tahrirlash funksiyasi bu yerda bo'ladi...</p>
        <div className="flex justify-end gap-2 mt-4">
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