import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone: string;
  unit?: string;
  community: string;
  address: string;
  fullAddress: string;
  repairCount: number;
  lastRepairDate: Date;
  repairs: Array<{
    id: string;
    type: string;
    status: string;
    date: Date;
    updatedAt?: Date;
  }>;
}

export default function CustomerProfile() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataWarnings, setDataWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterCommunity, setFilterCommunity] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'repairCount' | 'lastRepairDate'>>({
    name: '',
    phone: '',
    unit: '',
    community: '',
    address: '',
    fullAddress: '',
    repairs: []
  });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const savedCustomers = localStorage.getItem('customers');
        
        // 如果没有数据且没有ID参数，显示空状态
        if (!savedCustomers && !id) {
          setCustomers([]);
          setIsLoading(false);
          return;
        }

        if (!savedCustomers) {
          setCustomers([]);
          if (id) {
            setError('未找到客户数据');
            toast.error('系统中暂无客户数据');
          }
          setIsLoading(false);
          return;
        }

        // 验证JSON格式
        let parsedCustomers;
        try {
          parsedCustomers = JSON.parse(savedCustomers);
          if (!Array.isArray(parsedCustomers)) {
            throw new Error('客户数据格式错误');
          }
        } catch (e) {
          throw new Error('客户数据格式错误，无法解析');
        }

          // 数据迁移处理 - 处理缺失的小区和地址
          const migratedCustomers = parsedCustomers.map((customer: any) => {
            // 确保customer是对象
            if (!customer || typeof customer !== 'object') {
              return {
                id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  const r = Math.random() * 16 | 0;
                  const v = c === 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                }),
                name: '',
                phone: '',
                community: '未指定小区',
                address: '未指定地址',
                fullAddress: '未指定地址',
                repairCount: 0,
                lastRepairDate: new Date(),
                repairs: []
              };
            }

            // 处理缺失的小区和地址
            if (!customer.community || !customer.address) {
              console.warn('客户数据缺少小区或地址信息，已使用默认值', customer);
              customer.community = customer.community || '未指定小区';
              customer.address = customer.address || '未指定地址';
            }
            
            customer.fullAddress = `${customer.community} ${customer.address}`.trim();

            // 迁移旧ID格式
            if (!customer.id || customer.id === customer.phone || !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(customer.id)) {
              customer.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              });
            }

            // 确保repairs数组存在且是数组
            if (!customer.repairs || !Array.isArray(customer.repairs)) {
              customer.repairs = [];
            }

            return customer;
          });

        // 保存迁移后的数据
        try {
          localStorage.setItem('customers', JSON.stringify(migratedCustomers));
        } catch (e) {
          console.error('保存迁移数据失败:', e);
        }

        setCustomers(migratedCustomers);
        
        // 处理客户ID查询
        if (id) {
          if (!id || id === 'undefined' || id === 'null') {
            setError('无效的客户ID');
            toast.error('无效的客户ID');
            setIsLoading(false);
            return;
          }
          
          const foundCustomer = migratedCustomers.find((c: Customer) => c.id === id);
          if (!foundCustomer) {
            setError('未找到该客户信息');
            toast.error('未找到该客户信息');
          }
          setCurrentCustomer(foundCustomer || null);
        }
      } catch (error) {
        console.error('加载客户数据失败:', error);
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        setError(`加载客户数据失败: ${errorMsg}`);
        if (dataWarnings.length > 0) {
          toast.warning(`数据加载完成，但有${dataWarnings.length}条警告`, {
            action: {
              label: '查看',
              onClick: () => alert(dataWarnings.join('\n\n'))
            }
          });
        } else {
          toast.error(`加载失败: ${errorMsg}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [id]);

  // 如果没有ID参数且没有错误，显示客户列表
  if (!id && !error && !isLoading) {

    const filteredCustomers = customers.filter(customer => {
      const communityMatch = filterCommunity ? customer.community.includes(filterCommunity) : true;
      const addressMatch = filterAddress ? customer.address.includes(filterAddress) : true;
      return communityMatch && addressMatch;
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">客户档案</h1>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-[#4A90E2] hover:text-blue-600 transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              返回首页
            </button>
          </div>

          {/* 筛选表单 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">筛选条件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">小区</label>
                <input
                  type="text"
                  value={filterCommunity}
                  onChange={(e) => setFilterCommunity(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="输入小区名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input
                  type="text"
                  value={filterAddress}
                  onChange={(e) => setFilterAddress(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="输入地址"
                />
              </div>
            </div>
          </div>

          {customers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center py-20">
              <i className="fa-solid fa-users text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-700">暂无客户数据</h3>
              <p className="text-gray-500 mt-2">您还没有添加任何客户信息</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-[#4A90E2] text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                添加客户
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4 text-sm text-gray-500">
                共 {filteredCustomers.length} 条记录（{customers.length} 条总数）
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">小区</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地址</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">报修次数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link to={`/customer-profile/${customer.id}`} className="text-blue-500 hover:text-blue-700">
                            {customer.community}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.repairCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link
                            to={`/customer-profile/${customer.id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            查看详情
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (id) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6 text-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-700">正在加载客户数据...</h3>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6 text-center py-20">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-700">加载客户数据失败</h3>
            <p className="text-gray-500 mt-2">{error}</p>
            <div className="mt-6 space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                <i className="fa-solid fa-rotate-right mr-2"></i>
                重新加载
              </button>
              <button 
                onClick={() => navigate('/customer-profile')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                返回客户列表
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentCustomer) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6 text-center py-20">
            <i className="fa-solid fa-user-slash text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-700">未找到客户信息</h3>
            <p className="text-gray-500 mt-2">请检查客户ID是否正确</p>
            <div className="mt-6 space-x-4">
              <button 
                onClick={() => navigate('/customer-profile')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                返回客户列表
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }
    
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-800">客户详情</h1>
             <div className="flex space-x-4">
               <button 
                 onClick={() => navigate('/customer-profile')}
                 className="flex items-center text-[#4A90E2] hover:text-blue-600 transition-colors"
               >
                 <i className="fa-solid fa-arrow-left mr-2"></i>
                 返回列表
               </button>
               <button
                 onClick={() => {
                   if (confirm('确定要删除这个客户档案吗？此操作将同时删除关联的工单数据，且无法恢复！')) {
                     // 删除客户数据
                     const savedCustomers = localStorage.getItem('customers');
                     if (savedCustomers) {
                       const customers = JSON.parse(savedCustomers);
                       const updatedCustomers = customers.filter((c: any) => c.id !== currentCustomer.id);
                       localStorage.setItem('customers', JSON.stringify(updatedCustomers));
                       
                       // 删除关联工单
                       const savedRepairs = localStorage.getItem('repairs');
                       if (savedRepairs) {
                         const repairs = JSON.parse(savedRepairs);
                         const updatedRepairs = repairs.filter((r: any) => r.customerId !== currentCustomer.id);
                         localStorage.setItem('repairs', JSON.stringify(updatedRepairs));
                       }
                       
                       toast.success('客户档案已删除');
                       navigate('/customer-profile');
                     }
                   }
                 }}
                 className="flex items-center text-red-500 hover:text-red-600 transition-colors"
               >
                 <i className="fa-solid fa-trash mr-2"></i>
                 删除客户
               </button>
             </div>
           </div>

         <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">联系人: </span>
                    <span>{currentCustomer.name || '未填写'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">联系电话: </span>
                    <span>{currentCustomer.phone || '未填写'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">位置信息</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">小区: </span>
                    <span>{currentCustomer.community}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">详细地址: </span>
                    <span>{currentCustomer.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">报修统计</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">报修次数: </span>
                    <span>{currentCustomer.repairCount}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">最近报修: </span>
                    <span>{new Date(currentCustomer.lastRepairDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">关联工单</h2>
           {currentCustomer.repairs.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工单号</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">优先级</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {(() => {
                      const getStatusClass = (status) => {
                        switch(status) {
                          case '已完成': return 'bg-green-100 text-green-800';
                          case '处理中': return 'bg-yellow-100 text-yellow-800';
                          case '待处理': return 'bg-gray-100 text-gray-800';
                          default: return 'bg-red-100 text-red-800';
                        }
                      };

                      const validRepairs = [...currentCustomer.repairs]
                        .filter(repair => 
                          repair && typeof repair === 'object' && 
                          repair.id && typeof repair.id === 'string'
                        )
                        .sort((a, b) => {
                          try {
                            const dateA = a.updatedAt || a.date;
                            const dateB = b.updatedAt || b.date;
                            return new Date(dateB).getTime() - new Date(dateA).getTime();
                          } catch {
                            return 0;
                          }
                        });

                      return validRepairs.map((repair) => {
                        let displayDate = '未知日期';
                        try {
                          displayDate = new Date(repair.date).toLocaleDateString();
                        } catch {
                          console.warn('无效的日期格式:', repair.date);
                        }

                         return (
                           <tr key={repair.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{repair.id}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.type || '-'}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               <span className={'px-2 py-1 text-xs rounded-full ' + getStatusClass(repair.status)}>
                                 {repair.status || '未知'}
                               </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {displayDate}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {repair.priority || '中'}
                             </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 <button
                                   onClick={() => navigate(`/process/${repair.id}`)}
                                   className="text-blue-500 hover:text-blue-700"
                                 >
                                   查看工单
                                 </button>
                               </td>
                           </tr>
                         );
                      });
                    })()}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="text-center py-8 bg-gray-50 rounded-lg">
               <p className="text-gray-500">暂无关联工单</p>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 }
}