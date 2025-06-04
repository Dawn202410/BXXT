import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, BarChart, PieChart, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, Bar, Pie, Cell, Legend, Line } from 'recharts';
import { toast } from 'sonner';

// 模拟数据
const mockData = {
  byType: [
    { type: '楼宇对讲', count: 12 },
    { type: '楼道照明', count: 8 },
    { type: '电梯故障', count: 5 },
    { type: '水管漏水', count: 7 },
    { type: '电路问题', count: 3 },
  ],
  byArea: [
    { area: '朝阳区', count: 15 },
    { area: '海淀区', count: 10 },
    { area: '西城区', count: 5 },
    { area: '东城区', count: 5 },
  ],
  byTime: [
    { date: '05-01', count: 2 },
    { date: '05-02', count: 3 },
    { date: '05-03', count: 5 },
    { date: '05-04', count: 4 },
    { date: '05-05', count: 7 },
    { date: '05-06', count: 6 },
    { date: '05-07', count: 8 },
  ],
  performance: [
    { staff: '王师傅', completed: 12, avgTime: 2.5 },
    { staff: '李师傅', completed: 8, avgTime: 3.2 },
    { staff: '张师傅', completed: 6, avgTime: 4.1 },
    { staff: '赵师傅', completed: 4, avgTime: 2.8 },
  ],
};

const COLORS = ['#4A90E2', '#36A2EB', '#4DD0E1', '#00C853', '#FFC107'];

export default function Admin() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: '2025-05-01',
    end: '2025-05-07',
  });

  const handleExport = () => {
    toast.success('数据已导出');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">开始日期</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="p-2 border rounded-md"
              />
            </div>
          <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">结束日期</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="p-2 border rounded-md"
              />
            </div>
            <button
              onClick={handleExport}
              className="bg-[#4A90E2] text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              <i className="fa-solid fa-download mr-2"></i>
              导出数据
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-[#4A90E2] hover:text-blue-600 transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              返回首页
            </button>
          </div>
        </div>

        {/* 数据看板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 按类型分布 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">报修类型分布</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4A90E2" name="报修数量" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 按区域分布 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">区域报修分布</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.byArea}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="area"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockData.byArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 时间趋势 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">报修时间趋势</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.byTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.2} name="报修数量" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 维修人员绩效 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">维修人员绩效</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">维修人员</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完成数量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均处理时间(天)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockData.performance.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.staff}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.completed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.avgTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
