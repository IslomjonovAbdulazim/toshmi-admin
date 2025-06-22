import { useLocation, Link } from 'react-router-dom';

const menuItems = [
  { path: '/', name: 'Boshqaruv paneli', icon: '📊' },
  { path: '/users', name: 'Foydalanuvchilar', icon: '👥' },
  { path: '/groups', name: 'Guruhlar', icon: '🏫' },
  { path: '/subjects', name: 'Fanlar', icon: '📚' },
  { path: '/students', name: "O'quvchilar", icon: '🎓' },
  { path: '/schedule', name: 'Dars jadvali', icon: '📅' },
  { path: '/payments', name: "To'lovlar", icon: '💰' },
  { path: '/news', name: 'Yangiliklar', icon: '📰' }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50 lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold text-gray-900">ToshMI</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500">
          © 2024 ToshMI Admin
        </div>
      </div>
    </>
  );
}