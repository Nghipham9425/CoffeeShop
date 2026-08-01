import React, { useState, useEffect } from 'react';
import { AdminPageShell } from '../shared/AdminPageShell';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

const PromotionsPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]); 
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]); 
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // Thêm State quản lý Kênh áp dụng (Price Type)
  const [priceType, setPriceType] = useState('RETAIL'); // Thay RETAIL bằng giá trị đầu tiên trong Enum của bạn

  const [discountType, setDiscountType] = useState('PERCENT_DECREASE'); 
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = allProducts;
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory) {
      result = result.filter(p => p.categoryId == selectedCategory);
    }
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, allProducts]);

  const getAuthToken = () => {
    const commonKeys = ['token', 'admin_token', 'accessToken', 'access_token', 'jwt', 'auth_token'];
    for (const k of commonKeys) {
      const val = localStorage.getItem(k);
      if (val && val !== 'undefined' && val !== 'null') return val;
    }
    const userKeys = ['user', 'admin', 'auth'];
    for (const k of userKeys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed.token) return parsed.token;
          if (parsed.accessToken) return parsed.accessToken;
        } catch (e) {}
      }
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key || '');
      if (val && typeof val === 'string' && val.startsWith('eyJ')) return val;
    }
    return '';
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data?.items || json.data?.data || json.data || []);
      setCategories(items);
    } catch (error) { console.error('Lỗi khi tải danh mục:', error); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/products', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        cache: 'no-store' 
      });
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data?.items || json.data?.data || json.data || []);
      setAllProducts(items);
      setFilteredProducts(items);
    } catch (error) { console.error('Lỗi khi tải sản phẩm:', error); }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) return alert('Vui lòng chọn ít nhất 1 sản phẩm!');
    if (!discountValue || Number(discountValue) <= 0) return alert('Vui lòng nhập mức phần trăm hợp lệ!');

    const token = getAuthToken();
    if (!token) return alert('Phiên đăng nhập hết hạn. Vui lòng thử đăng xuất và đăng nhập lại!');

    setIsSubmitting(true);

    try {
      const promises = selectedProductIds.map(async id => {
        const product = allProducts.find(p => p.id === id);
        if (!product) return Promise.resolve();

        let finalPrice = Number(product.price);
        const val = Number(discountValue);

        if (discountType === 'PERCENT_DECREASE') finalPrice = finalPrice - (finalPrice * val / 100);
        else if (discountType === 'PERCENT_INCREASE') finalPrice = finalPrice + (finalPrice * val / 100);

        const res = await fetch('http://localhost:4000/api/promotions/product-price', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            productIds: [id],
            priceType: priceType, // Gửi biến động thay vì chữ cứng 'B2C'
            price: Math.max(0, Math.round(finalPrice)),
            minQuantity: 1,
            startAt: new Date(startDate).toISOString(),
            endAt: new Date(endDate).toISOString(),
          })
        });

        const errData = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(errData.message || `Lỗi từ máy chủ: ${res.status}`);
        }
        return errData;
      });

      await Promise.all(promises);
      alert('Áp dụng mức giá mới thành công!');
      
      setDiscountValue('');
      setStartDate('');
      setEndDate('');
      setSelectedProductIds([]);
      fetchProducts(); 
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Có lỗi xảy ra khi thiết lập giá!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminPageShell 
      title="Khuyến Mãi & Chỉnh Giá"
      description="Quản lý và thiết lập hàng loạt các đợt giảm giá hoặc tăng giá cho sản phẩm"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-4 border-[#E8D3C7] shadow-sm rounded-xl overflow-hidden sticky top-6">
          <div className="p-5 border-b border-[#E8D3C7] bg-[#FAF9F6]">
            <h3 className="font-bold text-lg text-[#553B2F] tracking-tight">Thiết Lập Mức Giá</h3>
          </div>
          <CardContent className="p-5">
            <div className="mb-5 pb-4 border-b border-[#E8D3C7]/50">
              <p className="text-sm font-semibold text-[#AA7864] uppercase tracking-wider mb-1">Đang chọn</p>
              <p className="text-2xl font-black text-[#553B2F]">{selectedProductIds.length} <span className="text-base font-medium">sản phẩm</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Thêm phần chọn Kênh áp dụng */}
              <div>
                <label className="block mb-1.5 text-sm font-bold text-[#553B2F]">Kênh áp dụng <span className="text-red-500">*</span></label>
                <select 
                  className="border border-[#E8D3C7] focus:border-[#AA7864] outline-none p-2.5 rounded-lg w-full text-sm text-[#553B2F] bg-white transition-colors"
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                >
                  {/* LƯU Ý: Đổi các value="RETAIL" thành từ khóa đúng trong schema.prisma của bạn */}
                  <option value="RETAIL">Bán lẻ (B2C)</option>
                  <option value="WHOLESALE">Bán sỉ (B2B)</option>
                  <option value="VIP">Khách VIP</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-[#553B2F]">Loại điều chỉnh <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="discountType" value="PERCENT_DECREASE" checked={discountType === 'PERCENT_DECREASE'} onChange={(e) => setDiscountType(e.target.value)} className="w-4 h-4 accent-[#22c55e]" />
                    <span className="text-sm font-bold text-[#22c55e]">Giảm giá (-)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="discountType" value="PERCENT_INCREASE" checked={discountType === 'PERCENT_INCREASE'} onChange={(e) => setDiscountType(e.target.value)} className="w-4 h-4 accent-[#ef4444]" />
                    <span className="text-sm font-bold text-[#ef4444]">Tăng giá (+)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-bold text-[#553B2F]">Mức phần trăm (%) <span className="text-red-500">*</span></label>
                <input type="number" required min="0" max="100" placeholder="VD: 20" className="border border-[#E8D3C7] focus:border-[#AA7864] focus:ring-1 focus:ring-[#AA7864] outline-none p-2.5 rounded-lg w-full text-sm transition-colors" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-bold text-[#553B2F]">Thời gian Bắt đầu <span className="text-red-500">*</span></label>
                <input type="datetime-local" required className="border border-[#E8D3C7] focus:border-[#AA7864] outline-none p-2.5 rounded-lg w-full text-sm text-[#553B2F] transition-colors" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              
              <div>
                <label className="block mb-1.5 text-sm font-bold text-[#553B2F]">Thời gian Kết thúc <span className="text-red-500">*</span></label>
                <input type="datetime-local" required className="border border-[#E8D3C7] focus:border-[#AA7864] outline-none p-2.5 rounded-lg w-full text-sm text-[#553B2F] transition-colors" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-[#553B2F] hover:bg-[#3c271f] text-white py-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]">
                {isSubmitting ? 'Đang xử lý...' : 'Áp Dụng Thiết Lập'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 border-[#E8D3C7] shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#E8D3C7] bg-[#FAF9F6]">
            <h3 className="font-bold text-lg text-[#553B2F] tracking-tight">Danh Sách Sản Phẩm</h3>
          </div>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-4 p-5 border-b border-[#E8D3C7]/50">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input type="text" placeholder="Tìm theo tên sản phẩm..." className="border border-[#E8D3C7] focus:border-[#AA7864] outline-none pl-9 pr-3 py-2.5 rounded-lg w-full text-sm transition-colors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select className="border border-[#E8D3C7] focus:border-[#AA7864] outline-none p-2.5 rounded-lg text-sm text-[#553B2F] bg-white transition-colors md:w-64" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Tất cả danh mục</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] relative">
              <table className="w-full text-left text-sm text-[#553B2F]">
                <thead className="bg-[#FAF9F6] text-[#AA7864] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input type="checkbox" className="w-4 h-4 accent-[#553B2F] rounded cursor-pointer" checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleSelectAll} />
                    </th>
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">Tên Sản Phẩm</th>
                    <th className="p-4 font-bold whitespace-nowrap">Giá Gốc</th>
                    <th className="p-4 font-bold whitespace-nowrap">Giá Điều Chỉnh</th>
                    <th className="p-4 font-bold">Thời Gian Áp Dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D3C7]/40">
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-[#AA7864] font-medium">Không tìm thấy sản phẩm nào phù hợp.</td></tr>
                  ) : (
                    filteredProducts.map((product: any) => {
                      const activePromo = product.prices?.[0]; 
                      const isModified = !!activePromo && activePromo.price !== product.price;

                      return (
                        <tr key={product.id} className="hover:bg-[#E8D3C7]/10 transition-colors">
                          <td className="p-4 text-center">
                            <input type="checkbox" className="w-4 h-4 accent-[#553B2F] rounded cursor-pointer" checked={selectedProductIds.includes(product.id)} onChange={() => toggleProductSelection(product.id)} />
                          </td>
                          <td className="p-4 font-semibold text-gray-500">#{product.id}</td>
                          <td className="p-4 font-medium">{product.name}</td>
                          <td className="p-4 whitespace-nowrap">{Number(product.price).toLocaleString('vi-VN')} đ</td>
                          
                          <td className="p-4 whitespace-nowrap">
                            {isModified ? (
                              <span className={`font-bold ${activePromo.price < product.price ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                {Number(activePromo.price).toLocaleString('vi-VN')} đ
                              </span>
                            ) : (
                              <span className="text-[#22c55e] font-semibold">Chưa có</span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                            {isModified && activePromo.endAt ? formatDate(activePromo.endAt) : '---'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  );
};

export default PromotionsPage;