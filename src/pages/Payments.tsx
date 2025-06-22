import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { Payment, Student } from '../types';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount_paid: '',
    is_fully_paid: false,
    comment: ''
  });

  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [selectedMonth, selectedYear]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/payments?month=${selectedMonth}&year=${selectedYear}`);
      setPayments(response.data);
    } catch (error) {
      console.error("To'lovlarni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students/search');
      setStudents(response.data);
    } catch (error) {
      console.error("O'quvchilarni olishda xatolik:", error);
    }
  };

  const createPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/payments', {
        ...newPayment,
        amount_paid: parseFloat(newPayment.amount_paid)
      });
      setShowCreateModal(false);
      setNewPayment({
        student_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount_paid: '',
        is_fully_paid: false,
        comment: ''
      });
      fetchPayments();
    } catch (error) {
      console.error("To'lov yaratishda xatolik:", error);
    }
  };

  const updatePaymentStatus = async (id: string, isFullyPaid: boolean) => {
    try {
      await api.patch(`/admin/payments/${id}`, { is_fully_paid: isFullyPaid });
      fetchPayments();
    } catch (error) {
      console.error("To'lov holatini yangilashda xatolik:", error);
    }
  };

  const totalPaid = payments.filter(p => p.is_fully_paid).reduce((sum, p) => sum + p.amount_paid, 0);
  const totalUnpaid = payments.filter(p => !p.is_fully_paid).reduce((sum, p) => sum + p.amount_paid, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">To'lovlar</h1>
          <p className="text-gray-600">O'quvchilar to'lovlarini boshqarish</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + To'lov qo'shish
        </Button>
      </div>

      {/* Month/Year selector & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oy</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yil</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">To'langan</p>
                <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500">so'm</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">To'lanmagan</p>
                <p className="text-2xl font-bold text-red-600">{totalUnpaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500">so'm</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                ❌
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami</p>
                <p className="text-2xl font-bold text-blue-600">{(totalPaid + totalUnpaid).toLocaleString()}</p>
                <p className="text-xs text-gray-500">so'm</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                💰
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {months[selectedMonth - 1]} {selectedYear} - To'lovlar ({payments.length})
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">O'quvchi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To'langan sana</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {payment.student?.user?.full_name?.charAt(0).toUpperCase() || 'O'}
                          </div>
                          <span className="font-medium">{payment.student?.user?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {payment.amount_paid.toLocaleString()} so'm
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.is_fully_paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.is_fully_paid ? "To'langan" : "To'lanmagan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(payment.paid_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant={payment.is_fully_paid ? "secondary" : "primary"}
                          onClick={() => updatePaymentStatus(payment.id, !payment.is_fully_paid)}
                        >
                          {payment.is_fully_paid ? "❌" : "✅"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yangi to'lov</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={createPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O'quvchi</label>
                <select
                  value={newPayment.student_id}
                  onChange={(e) => setNewPayment({...newPayment, student_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">O'quvchini tanlang</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.user?.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oy</label>
                  <select
                    value={newPayment.month}
                    onChange={(e) => setNewPayment({...newPayment, month: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yil</label>
                  <select
                    value={newPayment.year}
                    onChange={(e) => setNewPayment({...newPayment, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="To'lov summasi"
                type="number"
                value={newPayment.amount_paid}
                onChange={(e) => setNewPayment({...newPayment, amount_paid: e.target.value})}
                placeholder="Masalan: 500000"
                required
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fully_paid"
                  checked={newPayment.is_fully_paid}
                  onChange={(e) => setNewPayment({...newPayment, is_fully_paid: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="fully_paid" className="text-sm text-gray-700">
                  To'liq to'langan
                </label>
              </div>

              <Input
                label="Izoh (ixtiyoriy)"
                value={newPayment.comment}
                onChange={(e) => setNewPayment({...newPayment, comment: e.target.value})}
                placeholder="Qo'shimcha ma'lumot"
              />
              
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit">Yaratish</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}