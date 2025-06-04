import { useState, useRef, ChangeEvent } from 'react';
import { z } from 'zod';
import { ReportFormData } from '@/pages/Report';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';




const issueDetailSchema = z.object({
  type: z.string().min(1, '请选择故障类型'),
  priority: z.enum(['高', '中', '低']),
  description: z.string().min(1, '请输入故障描述')
});

interface IssueDetailStepProps {
  onSubmit: (data: Partial<ReportFormData>) => void;
  onPrev: () => void;
  initialData: Partial<ReportFormData>;
}

export default function IssueDetailStep({ onSubmit, onPrev, initialData }: IssueDetailStepProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: initialData.type || '',
    priority: initialData.priority || '中',
    description: initialData.description || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const faultTypes = [
    '楼宇对讲系统',
    '楼道照明系统',
    '监控安防系统',
    '道闸系统'
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (files.length + formData.images.length > 3) {
        setErrors({ ...errors, images: '最多上传3张图片' });
        return;
      }

      const newImages = files.map(file => URL.createObjectURL(file));
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages]
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    URL.revokeObjectURL(newImages[index]);
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 重置错误状态
    setErrors({});

    // 基础验证
    if (!formData.type || !formData.description) {
      const newErrors: Record<string, string> = {};
      const missingFields = [];
      
      if (!formData.type) {
        missingFields.push('故障类型');
        newErrors['type'] = '请选择故障类型';
      }
      if (!formData.description) {
        missingFields.push('故障描述');
        newErrors['description'] = '请输入故障描述';
      }
      
      setErrors(newErrors);
      
      // 更明显的错误提示
      toast.error(`表单填写不完整`, {
        description: `请填写${missingFields.join('和')}`,
        position: 'top-center',
        duration: 5000,
        action: {
          label: '前往填写',
          onClick: () => {
            const firstErrorField = !formData.type ? 'type' : 'description';
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              (element as HTMLElement).focus();
            }
          }
        }
      });

      // 滚动到第一个错误字段
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
        }
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validatedData = issueDetailSchema.parse(formData);
        try {
          const result = await onSubmit(validatedData);
          if (!result) {
            throw new Error('提交失败，请重试');
          }
          toast.success('报修工单已成功保存', {
            position: 'top-center',
            duration: 3000
          });
          navigate('/');
          // 重置表单
          setFormData({
            type: '',
            priority: '中',
            description: ''
          });
          // 返回第一步
          onPrev();
        } catch (error) {
          console.error('保存工单失败:', error);
          toast.error(`保存工单失败: ${error instanceof Error ? error.message : '请重试'}`, {
            position: 'top-center',
            duration: 5000,
            action: {
              label: '重试',
              onClick: () => handleSubmit(e)
            }
          });
      }
    } catch (error) {
      console.error('表单验证失败:', error);
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        
        toast.error('表单验证失败', {
          description: '请检查并修正表单中的错误',
          position: 'top-center',
          duration: 5000,
          action: {
            label: '查看错误',
            onClick: () => {
              const firstErrorField = Object.keys(newErrors)[0];
              if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  (element as HTMLElement).focus();
                }
              }
            }
          }
        });

        // 滚动到第一个错误字段
        const firstErrorField = Object.keys(newErrors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (element as HTMLElement).focus();
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-800 mb-6">故障详情</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">故障类型</label>
          <select
            name="type"
            className="w-full p-2 border rounded-md"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">请选择故障类型</option>
            {faultTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
           {errors.type && (
             <p className="text-red-500 text-sm mt-1 flex items-center">
               <i className="fa-solid fa-circle-exclamation mr-1"></i>
               {errors.type}
             </p>
           )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">优先级</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="高"
                checked={formData.priority === '高'}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-red-500">高</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="中"
                checked={formData.priority === '中'}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-yellow-500">中</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="低"
                checked={formData.priority === '低'}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-green-500">低</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">故障描述</label>
          <textarea
            name="description"
            className="w-full p-2 border rounded-md h-32"
            placeholder="请详细描述故障情况"
            value={formData.description}
            onChange={handleChange}
          />
           {errors.description && (
             <p className="text-red-500 text-sm mt-1 flex items-center">
               <i className="fa-solid fa-circle-exclamation mr-1"></i>
               {errors.description}
             </p>
           )}
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
            className={`px-6 py-2 rounded-md transition-colors flex items-center justify-center min-w-24 ${
              !formData.type || !formData.description
                ? 'bg-red-100 text-red-600 border-2 border-red-400 cursor-not-allowed shadow-sm'
                : 'bg-[#4A90E2] text-white hover:bg-blue-600 hover:shadow-md'
            }`}
            disabled={!formData.type || !formData.description || isSubmitting}
            onClick={(e) => {
              if (!formData.type || !formData.description) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                提交中...
              </div>
            ) : !formData.type || !formData.description ? (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex items-center"
              >
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                请填写完整
              </motion.div>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane mr-2"></i>
                提交报修
              </>
            )}
          </button>
      </div>
    </form>
  );
}
