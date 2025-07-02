import React, { useEffect, useState } from 'react';
import { FiUserCheck, FiUserX, FiCalendar } from 'react-icons/fi';
import HRSidebar from './HRSidebar';
// import Card, CardHeader, CardTitle, CardContent, CardDescription, Tabs, TabsList, TabsTrigger, TabsContent, Avatar, AvatarImage, AvatarFallback, Badge from your component library or implement simple versions inline if not available

const Card = ({ className = '', children }) => (
  <div className={`rounded-lg bg-white border p-4 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ className = '', children }) => (
  <div className={`mb-2 ${className}`}>{children}</div>
);
const CardTitle = ({ className = '', children }) => (
  <div className={`font-semibold text-lg ${className}`}>{children}</div>
);
const CardContent = ({ className = '', children }) => (
  <div className={className}>{children}</div>
);
const CardDescription = ({ className = '', children }) => (
  <div className={`text-sm text-gray-500 ${className}`}>{children}</div>
);
const Tabs = ({ defaultValue, children }) => {
  const [active, setActive] = useState(defaultValue);
  return React.Children.map(children, child => {
    if (child.type === TabsList) {
      return React.cloneElement(child, { active, setActive });
    }
    if (child.type === TabsContent) {
      return React.cloneElement(child, { active });
    }
    return child;
  });
};
const TabsList = ({ children, active, setActive, className = '' }) => (
  <div className={className} style={{ display: 'flex' }}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { active, setActive })
    )}
  </div>
);
const TabsTrigger = ({ value, children, active, setActive, className = '' }) => (
  <button
    className={
      `px-4 py-2 rounded-t ${active === value ? 'bg-white text-orange-600' : 'bg-orange-50 text-gray-600'} ${className}`
    }
    onClick={() => setActive(value)}
    style={{ border: 'none', outline: 'none', cursor: 'pointer' }}
  >
    {children}
  </button>
);
const TabsContent = ({ value, active, children, className = '' }) => (
  active === value ? <div className={className}>{children}</div> : null
);
const Avatar = ({ className = '', children }) => (
  <div className={`rounded-full overflow-hidden ${className}`} style={{ width: 40, height: 40 }}>{children}</div>
);
const AvatarImage = ({ src, alt }) => (
  <img src={src} alt={alt} style={{ width: '100%', height: '100%' }} />
);
const AvatarFallback = ({ className = '', children }) => (
  <div className={`flex items-center justify-center w-full h-full ${className}`}>{children}</div>
);
const Badge = ({ className = '', children, variant }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${className}`}>{children}</span>
);

const HRAms = ({ user, onLogout }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('present');
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || !selectedDate) return;
    setLoading(true);
    fetch(`http://localhost:8000/hr-ams?hr=${encodeURIComponent(user.username)}&date=${selectedDate}`)
      .then(res => res.json())
      .then(apiData => {
        setData(Array.isArray(apiData) ? apiData : (apiData.data || []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, selectedDate]);

  if (loading) return <div>Loading...</div>;

  // Get unique years from data
  const years = Array.from(new Set(data.map(item => new Date(item.date).getFullYear())));

  // Filter by month/year
  let filtered = data;
  if (month) filtered = filtered.filter(item => new Date(item.date).getMonth() + 1 === parseInt(month));
  if (year) filtered = filtered.filter(item => new Date(item.date).getFullYear() === parseInt(year));

  // Filter by search
  if (search) {
    filtered = filtered.filter(item =>
      (item.employee_name && item.employee_name.toLowerCase().includes(search.toLowerCase()))
    );
  }

  // Filter by tab (present/absent)
  const totalEmployees = data.filter((u, idx, arr) => {
    const key = u.employee_id || u.id;
    return arr.findIndex(x => (x.employee_id || x.id) === key) === idx;
  }).length;
  const presentUsers = filtered.filter(u => u.status === 'present' && u.date === selectedDate);
  const absentUsers = filtered.filter(u => u.status === 'absent' && u.date === selectedDate);
  const presentCount = presentUsers.length;
  const absentCount = absentUsers.length;

  // Export to CSV
  const handleExport = () => {
    const rows = [
      ['Name', 'Date', 'Check In', 'Check Out', 'Working Hrs', 'Status'],
      ...filtered.map(u => [u.employee_name, u.date, u.check_in, u.check_out, u.working_time, u.status])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Table data for selected date
  const tableData = tab === 'present' ? presentUsers : absentUsers;

  // Pagination logic for user cards
  const itemsPerPage = 3;
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <HRSidebar user={user} onLogout={onLogout} mainContent={
        <div className="employee-ams-main" style={{ flex: 1, background: 'none', minHeight: '100vh', width: '100%' }}>
          <div className="p-4" style={{ background: 'none', minHeight: '100vh', width: '100%' }}>
            {/* Top Row: Heading, Search, Export */}
            <div className="flex items-center justify-between mb-2" style={{ gap: 8 }}>
              <h2 className="text-2xl font-bold" style={{ color: '#F26522' }}>Attendance Dashboard</h2>
              <div className="flex gap-1 items-center flex-nowrap" style={{ flexWrap: 'nowrap' }}>
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                  style={{ minWidth: 120, height: 30 }}
                />
                <button onClick={handleExport} className="bg-orange-500 text-white px-4 py-1 rounded font-semibold text-sm" style={{ height: 30, minWidth: 100 }}>Export</button>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card className="border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <FiUserCheck className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalEmployees}</div>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Present Today</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FiUserCheck className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                </CardContent>
              </Card>
              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Absent Today</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <FiUserX className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                </CardContent>
              </Card>
            </div>
            {/* Present/Absent Buttons and User List */}
            <div className="mb-4">
              <div className="flex gap-1 items-center mb-3 flex-nowrap" style={{ flexWrap: 'nowrap' }}>
                <button
                  style={{
                    background: tab === 'present' ? '#F26522' : '#fff',
                    color: tab === 'present' ? '#fff' : '#F26522',
                    border: '1px solid #F26522',
                    borderRadius: 6,
                    fontWeight: 'bold',
                    minWidth: 90,
                    height: 30,
                    padding: '0.25rem 0.75rem',
                    fontSize: 14,
                    transition: 'background 0.2s, color 0.2s',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setTab('present')}
                >
                  Present
                </button>
                <button
                  style={{
                    background: tab === 'absent' ? '#F26522' : '#fff',
                    color: tab === 'absent' ? '#fff' : '#F26522',
                    border: '1px solid #F26522',
                    borderRadius: 6,
                    fontWeight: 'bold',
                    minWidth: 90,
                    height: 30,
                    padding: '0.25rem 0.75rem',
                    fontSize: 14,
                    transition: 'background 0.2s, color 0.2s',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setTab('absent')}
                >
                  Absent
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm ml-1"
                  style={{ minWidth: 120, width: 130, height: 30, marginLeft: 6, flexShrink: 0 }}
                />
              </div>
              {/* User cards, increased gap */}
              <div className="w-full" style={{ maxWidth: '100%', overflowX: 'hidden', marginBottom: 20 }}>
                {paginatedData.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 w-full">No records found.</div>
                ) : (
                  paginatedData.map((u, idx) => (
                    <div key={u.id || u.employee_id || idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200 shadow-sm mb-4" style={{ width: '100%', minHeight: 60, height: 80, maxWidth: '100%' }}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8" style={{ width: 32, height: 32 }}>
                          <AvatarFallback className={u.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} style={{ fontSize: 15, fontWeight: 700 }}>
                            {(u.employee_name ? u.employee_name[0] : '?')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm mb-1" style={{ maxWidth: 120, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.employee_name || '-'}</h3>
                          <div className="text-xs text-gray-500">Check-in: {u.status === 'present' ? (u.check_in || '-') : '-'}</div>
                          <div className="text-xs text-gray-500">Check-out: {u.status === 'present' ? (u.check_out || '-') : '-'}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 mb-1">Working: {u.status === 'present' ? (u.working_time || '-') : '-'}</div>
                        <Badge className={u.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {u.status === 'present' ? 'Present' : 'Absent'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
                {/* Entries info and pagination row */}
                <div className="flex justify-between items-center mt-6" style={{ gap: 12 }}>
                  <div className="text-xs text-gray-500" style={{ minWidth: 120 }}>
                    {tableData.length > 0 && (
                      <>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} entries</>
                    )}
                  </div>
                  <div className="flex justify-end items-center gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 rounded border text-sm" style={{ minWidth: 28 }}>&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2 py-1 rounded border text-sm ${currentPage === i + 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-500'}`}
                        style={{ minWidth: 28 }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 rounded border text-sm" style={{ minWidth: 28 }}>&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } />
    </div>
  );
};

export default HRAms; 