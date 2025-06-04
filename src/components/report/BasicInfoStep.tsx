import { useState } from 'react';
import { z } from 'zod';
import { ReportFormData } from '@/pages/Report';

const basicInfoSchema = z.object({
  date: z.date(),
  name: z.string().min(2, '姓名至少2个字符').optional(),
  unit: z.string().min(2, '单位名称至少2个字符'),
  phone: z.string().regex(/^(1[3-9]\d{9}|(\d{3,4}-?)?\d{7,8})?$/, '请输入有效的手机号或座机号').optional()
});

interface BasicInfoStepProps {
  onNext: (data: Partial<ReportFormData>) => void;
  initialData: Partial<ReportFormData>;
}

export default function BasicInfoStep({ onNext, initialData }: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    date: initialData.date || new Date(),
    name: initialData.name || '',
    unit: initialData.unit || '',
    phone: initialData.phone || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, date: new Date(e.target.value) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = basicInfoSchema.parse(formData);
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
      <h2 className="text-xl font-bold text-gray-800 mb-6">基本信息</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">报修日期</label>
          <input
            type="date"
            className="w-full p-2 border rounded-md"
            value={formData.date.toISOString().split('T')[0]}
            onChange={handleDateChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">报修单位</label>
          <input
            type="text"
            name="unit"
            className="w-full p-2 border rounded-md"
            placeholder="请输入报修单位名称"
            value={formData.unit}
            onChange={handleChange}
          />
          {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">联系人</label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border rounded-md"
            placeholder="请输入联系人姓名"
            value={formData.name}
            onChange={handleChange}
          />
        </div>


        <div>
          <label className="block text-gray-700 mb-1">联系电话</label>
          <input
            type="tel"
            name="phone"
            className="w-full p-2 border rounded-md"
            placeholder="请输入联系人的手机号"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>


      </div>

      <div className="mt-8 flex justify-end">
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
