import { useState } from 'react';
import { z } from 'zod';
import { ReportFormData } from '@/pages/Report';

const locationSchema = z.object({
  area: z.string().min(1, '请选择区域'),
  community: z.string().min(1, '请输入小区名称'),
  address: z.string().min(5, '详细地址格式应为楼号-单元号-门牌号')
});

interface LocationStepProps {
  onNext: (data: Partial<ReportFormData>) => void;
  onPrev: () => void;
  initialData: Partial<ReportFormData>;
}

export default function LocationStep({ onNext, onPrev, initialData }: LocationStepProps) {
  const [formData, setFormData] = useState({
    area: initialData.area || '',
    community: initialData.community || '',
    address: initialData.address || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 区域数据
  const areas = ['河东区', '南开区', '河北区'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // 当区域或小区改变时，重置下级选项
      if (name === 'area') {
        return { ...prev, area: value, community: '', building: '' };
      }
      if (name === 'community') {
        return { ...prev, community: value, building: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = locationSchema.parse(formData);
      onNext(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-800 mb-6">位置信息</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">区域</label>
          <select
            name="area"
            className="w-full p-2 border rounded-md"
            value={formData.area}
            onChange={handleChange}
          >
            <option value="">请选择区域</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">小区</label>
          <input
            type="text"
            name="community"
            className="w-full p-2 border rounded-md"
            placeholder="请输入小区名称"
            value={formData.community}
            onChange={handleChange}
          />
          {errors.community && <p className="text-red-500 text-sm mt-1">{errors.community}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">详细地址</label>
          <input
            type="text"
            name="address"
            className="w-full p-2 border rounded-md"
             placeholder="例如：5-3-502 (楼号-单元号-门牌号)"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          上一步
        </button>
        <button
          type="submit"
          className="bg-[#4A90E2] text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          下一步
        </button>
      </div>
    </form>
  );
}