'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { 
  ShieldAlert, 
  Settings, 
  LayoutDashboard, 
  MessageSquare, 
  Ticket, 
  MapPin, 
  BookOpen, 
  Gift, 
  FileText, 
  Check, 
  X, 
  Plus, 
  Edit2, 
  AlertCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  pointsBalanceCache: number;
}

interface AdminConsoleProps {
  user: User | null;
  onLoginClick?: () => void;
}

export default function AdminConsoleSection({ user, onLoginClick }: AdminConsoleProps) {
  // Core admin tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'tickets' | 'places' | 'guides' | 'vouchers' | 'audit_logs' | 'analytics'>('overview');
  
  // Data lists
  const [stats, setStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);

  // Filtering states
  const [reviewFilter, setReviewFilter] = useState<string>('pending');
  const [ticketFilter, setTicketFilter] = useState<string>('pending');
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [guideFilter, setGuideFilter] = useState<string>('all');
  const [voucherFilter, setVoucherFilter] = useState<string>('all');

  // Loading & error handling
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [brokenTickets, setBrokenTickets] = useState<Record<string, boolean>>({});

  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Analytics sub-modals states (Yêu cầu mới)
  const [showUsersModal, setShowUsersModal] = useState<boolean>(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  
  const [showRoutesModal, setShowRoutesModal] = useState<boolean>(false);
  const [routesList, setRoutesList] = useState<any[]>([]);
  const [routeSearchQuery, setRouteSearchQuery] = useState<string>('');
  
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const openUsersListModal = async () => {
    setShowUsersModal(true);
    setModalLoading(true);
    try {
      const data = await apiFetch('/api/admin/users');
      setUsersList(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi tải danh sách thành viên.');
    } finally {
      setModalLoading(false);
    }
  };

  const openRoutesListModal = async () => {
    setShowRoutesModal(true);
    setModalLoading(true);
    try {
      const data = await apiFetch('/api/admin/routes-all');
      setRoutesList(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi tải danh sách lộ trình.');
    } finally {
      setModalLoading(false);
    }
  };

  // Inline forms
  const [showPlaceForm, setShowPlaceForm] = useState<boolean>(false);
  const [placeFormMode, setPlaceFormMode] = useState<'create' | 'edit'>('create');
  const [editingPlaceId, setEditingPlaceId] = useState<string>('');
  const [placeData, setPlaceData] = useState({
    name: '',
    slug: '',
    category: 'cafe',
    stationId: '',
    lat: 10.7712,
    lng: 106.6976,
    address: '',
    shortDescription: '',
    description: '',
    district: '',
    walkingMinutes: 5,
    distanceMeters: 300,
    priceLevel: 1,
    tags: '',
    highlights: '',
    imageUrl: '',
    featured: false,
    isPublished: true
  });

  const [showGuideForm, setShowGuideForm] = useState<boolean>(false);
  const [guideFormMode, setGuideFormMode] = useState<'create' | 'edit'>('create');
  const [editingGuideId, setEditingGuideId] = useState<string>('');
  const [guideData, setGuideData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    relatedStationId: '',
    isPublished: true
  });

  const [showVoucherForm, setShowVoucherForm] = useState<boolean>(false);
  const [voucherFormMode, setVoucherFormMode] = useState<'create' | 'edit'>('create');
  const [editingVoucherId, setEditingVoucherId] = useState<string>('');
  const [voucherData, setVoucherData] = useState({
    name: '',
    slug: '',
    pointsCost: 100,
    stockTotal: 10,
    stockRemaining: 10,
    perUserLimit: 1,
    validFrom: '',
    validUntil: '',
    brandName: '',
    category: 'other',
    description: '',
    terms: '',
    imageUrl: '',
    isActive: true,
    encryptedCodes: ''
  });

  // Moderation notes
  const [moderationNote, setModerationNote] = useState<string>('');
  const [ticketPoints, setTicketPoints] = useState<number>(10);
  const [ticketNote, setTicketNote] = useState<string>('');

  // Auto clean notifications
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // Fetch initial base stations for dropdowns
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
      const getStations = async () => {
        try {
          const data = await apiFetch('/api/stations');
          setStations(data || []);
        } catch (err: any) {
          console.error('Fetch stations failed:', err);
        }
      };
      getStations();
      fetchTabContent('overview');
    }
  }, [user]);

  // Fetch content dynamically based on active tab
  const fetchTabContent = async (tabName: typeof activeTab) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (tabName === 'overview') {
        const data = await apiFetch('/api/admin/overview');
        setStats(data);
      } else if (tabName === 'reviews') {
        const data = await apiFetch(`/api/admin/reviews?status=${reviewFilter}`);
        setReviews(data || []);
      } else if (tabName === 'tickets') {
        const data = await apiFetch(`/api/admin/tickets?status=${ticketFilter}`);
        setTickets(data || []);
        setBrokenTickets({});
      } else if (tabName === 'places') {
        const data = await apiFetch(`/api/admin/places?status=${placeFilter}`);
        setPlaces(data || []);
      } else if (tabName === 'guides') {
        const data = await apiFetch(`/api/admin/guides?status=${guideFilter}`);
        setGuides(data || []);
      } else if (tabName === 'vouchers') {
        const data = await apiFetch(`/api/admin/vouchers?status=${voucherFilter}`);
        setVouchers(data || []);
      } else if (tabName === 'audit_logs') {
        const data = await apiFetch('/api/admin/audit-logs');
        setAuditLogs(data || []);
      } else if (tabName === 'analytics') {
        const data = await apiFetch('/api/admin/analytics');
        setAnalyticsData(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi tải dữ liệu kiểm duyệt.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when tab filters update
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
      fetchTabContent(activeTab);
    }
  }, [activeTab, reviewFilter, ticketFilter, placeFilter, guideFilter, voucherFilter]);

  // UGC Review Moderation Action
  const handleModerateReview = async (reviewId: string, decision: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/admin/reviews/${reviewId}/moderate`, {
        method: 'POST',
        body: JSON.stringify({ decision, note: moderationNote }),
      });
      setSuccessMsg(res.message || 'Duyệt đánh giá thành công.');
      setModerationNote('');
      fetchTabContent('reviews');
    } catch (err: any) {
      setErrorMsg(err.message || 'Duyệt đánh giá thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Ticket Moderation Action
  const handleModerateTicket = async (ticketId: string, decision: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/admin/tickets/${ticketId}/review`, {
        method: 'POST',
        body: JSON.stringify({ 
          decision, 
          points: ticketPoints, 
          note: ticketNote 
        }),
      });
      setSuccessMsg(res.message || 'Duyệt vé di chuyển thành công.');
      setTicketNote('');
      setTicketPoints(10);
      fetchTabContent('tickets');
    } catch (err: any) {
      setErrorMsg(err.message || 'Kiểm duyệt vé thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Places Form Submit (Create/Update)
  const handlePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const htmlRegex = /<[^>]*>/g;
    if (
      htmlRegex.test(placeData.name) ||
      htmlRegex.test(placeData.slug) ||
      htmlRegex.test(placeData.shortDescription) ||
      htmlRegex.test(placeData.description || '')
    ) {
      setErrorMsg('Nội dung nhập chứa thẻ HTML không hợp lệ.');
      return;
    }

    try {
      setLoading(true);
      const bodyData = {
        ...placeData,
        lat: parseFloat(placeData.lat as any) || 0,
        lng: parseFloat(placeData.lng as any) || 0,
        walkingMinutes: parseInt(placeData.walkingMinutes as any, 10) || 0,
        distanceMeters: parseFloat(placeData.distanceMeters as any) || 0,
        priceLevel: parseInt(placeData.priceLevel as any, 10) || 1,
        tags: placeData.tags.split(',').map(t => t.trim()).filter(Boolean),
        highlights: placeData.highlights.split(',').map(h => h.trim()).filter(Boolean),
      };

      if (placeFormMode === 'create') {
        await apiFetch('/api/admin/places', {
          method: 'POST',
          body: JSON.stringify(bodyData),
        });
        setSuccessMsg('Tạo địa điểm POI mới thành công.');
      } else {
        await apiFetch(`/api/admin/places/${editingPlaceId}`, {
          method: 'PATCH',
          body: JSON.stringify(bodyData),
        });
        setSuccessMsg('Cập nhật địa điểm thành công.');
      }

      setShowPlaceForm(false);
      fetchTabContent('places');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lưu thông tin địa điểm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Place publish status directly
  const handleTogglePlacePublish = async (place: any) => {
    try {
      setLoading(true);
      await apiFetch(`/api/admin/places/${place.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !place.isPublished }),
      });
      setSuccessMsg(`Đã ${!place.isPublished ? 'xuất bản' : 'hủy xuất bản'} địa điểm thành công.`);
      fetchTabContent('places');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi thay đổi trạng thái địa điểm.');
    } finally {
      setLoading(false);
    }
  };

  // Guides Form Submit (Create/Update)
  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const htmlRegex = /<[^>]*>/g;
    if (
      htmlRegex.test(guideData.title) ||
      htmlRegex.test(guideData.slug) ||
      htmlRegex.test(guideData.excerpt) ||
      htmlRegex.test(guideData.content)
    ) {
      setErrorMsg('Nội dung nhập chứa thẻ HTML không hợp lệ.');
      return;
    }

    try {
      setLoading(true);
      const bodyData = {
        ...guideData,
        tags: guideData.tags.split(',').map(t => t.trim()).filter(Boolean),
        relatedStationId: guideData.relatedStationId || null
      };

      if (guideFormMode === 'create') {
        await apiFetch('/api/admin/guides', {
          method: 'POST',
          body: JSON.stringify(bodyData),
        });
        setSuccessMsg('Tạo cẩm nang du lịch thành công.');
      } else {
        await apiFetch(`/api/admin/guides/${editingGuideId}`, {
          method: 'PATCH',
          body: JSON.stringify(bodyData),
        });
        setSuccessMsg('Cập nhật cẩm nang thành công.');
      }

      setShowGuideForm(false);
      fetchTabContent('guides');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lưu cẩm nang thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Guide Publish
  const handleToggleGuidePublish = async (guide: any) => {
    try {
      setLoading(true);
      await apiFetch(`/api/admin/guides/${guide.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !guide.isPublished }),
      });
      setSuccessMsg(`Đã ${!guide.isPublished ? 'xuất bản' : 'hủy xuất bản'} cẩm nang thành công.`);
      fetchTabContent('guides');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi thay đổi trạng thái cẩm nang.');
    } finally {
      setLoading(false);
    }
  };

  // Vouchers Form Submit (Create/Update)
  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const bodyData = {
        ...voucherData,
        pointsCost: parseInt(voucherData.pointsCost as any, 10) || 10,
        stockTotal: parseInt(voucherData.stockTotal as any, 10) || 0,
        stockRemaining: parseInt(voucherData.stockRemaining as any, 10) || 0,
        perUserLimit: parseInt(voucherData.perUserLimit as any, 10) || 1,
        validFrom: voucherData.validFrom || null,
        validUntil: voucherData.validUntil || null,
      };

      if (voucherFormMode === 'create') {
        await apiFetch('/api/admin/vouchers', {
          method: 'POST',
          body: JSON.stringify(bodyData),
        });
        setSuccessMsg('Tạo voucher mới thành công.');
      } else {
        await apiFetch(`/api/admin/vouchers/${editingVoucherId}`, {
          method: 'PATCH',
          body: JSON.stringify(bodyData),
        });
        setSuccessMsg('Cập nhật thông tin voucher thành công.');
      }

      setShowVoucherForm(false);
      fetchTabContent('vouchers');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lưu thông tin voucher thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Voucher Active
  const handleToggleVoucherActive = async (voucher: any) => {
    try {
      setLoading(true);
      await apiFetch(`/api/admin/vouchers/${voucher.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !voucher.isActive }),
      });
      setSuccessMsg(`Đã ${!voucher.isActive ? 'kích hoạt' : 'tạm dừng'} voucher thành công.`);
      fetchTabContent('vouchers');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi thay đổi trạng thái voucher.');
    } finally {
      setLoading(false);
    }
  };

  // Open edit forms with mapping
  const openEditPlace = (place: any) => {
    setPlaceFormMode('edit');
    setEditingPlaceId(place.id);
    setPlaceData({
      name: place.name || '',
      slug: place.slug || '',
      category: place.category || 'cafe',
      stationId: place.stationId || '',
      lat: place.lat || 10.7712,
      lng: place.lng || 106.6976,
      address: place.address || '',
      shortDescription: place.shortDescription || '',
      description: place.description || '',
      district: place.district || '',
      walkingMinutes: place.walkingMinutes || 5,
      distanceMeters: place.distanceMeters || 300,
      priceLevel: place.priceLevel || 1,
      tags: Array.isArray(place.tags) ? place.tags.join(', ') : '',
      highlights: Array.isArray(place.highlights) ? place.highlights.join(', ') : '',
      imageUrl: place.imageUrl || '',
      featured: place.featured || false,
      isPublished: place.isPublished !== false
    });
    setShowPlaceForm(true);
  };

  const openEditGuide = (guide: any) => {
    setGuideFormMode('edit');
    setEditingGuideId(guide.id);
    setGuideData({
      slug: guide.slug || '',
      title: guide.title || '',
      excerpt: guide.excerpt || '',
      content: guide.content || '',
      tags: Array.isArray(guide.tags) ? guide.tags.join(', ') : '',
      relatedStationId: guide.relatedStationId || '',
      isPublished: guide.isPublished !== false
    });
    setShowGuideForm(true);
  };

  const openEditVoucher = (voucher: any) => {
    setVoucherFormMode('edit');
    setEditingVoucherId(voucher.id);
    setVoucherData({
      name: voucher.name || '',
      slug: voucher.slug || '',
      pointsCost: voucher.pointsCost || voucher.cost || 100,
      stockTotal: voucher.stockTotal || voucher.quantity || 10,
      stockRemaining: voucher.stockRemaining ?? voucher.stockTotal ?? 10,
      perUserLimit: voucher.perUserLimit || 1,
      validFrom: voucher.validFrom ? new Date(voucher.validFrom).toISOString().split('T')[0] : '',
      validUntil: voucher.validUntil ? new Date(voucher.validUntil).toISOString().split('T')[0] : '',
      brandName: voucher.brandName || '',
      category: voucher.category || 'other',
      description: voucher.description || '',
      terms: voucher.terms || '',
      imageUrl: voucher.imageUrl || '',
      isActive: voucher.isActive !== false,
      encryptedCodes: voucher.encryptedCodes || ''
    });
    setShowVoucherForm(true);
  };

  // Helper date formatter
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Vô thời hạn';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 1. If not logged in
  if (!user) {
    return (
      <section className="bg-white/90 border border-eco-mint rounded-3xl p-8 text-center max-w-xl mx-auto shadow-md">
        <ShieldAlert className="mx-auto text-eco-muted w-12 h-12 mb-4" />
        <h3 className="text-xl font-extrabold text-eco-ink mb-2">Khu Vực Quản Trị Hệ Thống</h3>
        <p className="text-sm text-eco-muted mb-6">
          Vui lòng đăng nhập bằng tài khoản Quản trị viên (Admin) hoặc Kiểm duyệt viên (Moderator) để truy cập bảng điều khiển vận hành.
        </p>
        <button
          onClick={onLoginClick}
          className="px-6 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-sm font-bold rounded-full transition-all duration-200"
        >
          🔐 Đăng nhập ngay
        </button>
      </section>
    );
  }

  // 2. If user is a typical USER role
  if (user.role === 'USER') {
    return (
      <section className="bg-white/90 border border-red-200 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-md">
        <ShieldAlert className="mx-auto text-red-500 w-12 h-12 mb-4 animate-bounce" />
        <h3 className="text-xl font-extrabold text-red-800 mb-2">Truy Cập Bị Từ Chối</h3>
        <p className="text-sm text-eco-muted">
          Bạn không có quyền truy cập khu vực quản trị. Vui lòng đăng xuất và đăng nhập lại bằng tài khoản có vai trò ADMIN hoặc MODERATOR.
        </p>
      </section>
    );
  }

  // 3. User is ADMIN/MODERATOR: Render Admin Console Dashboard
  return (
    <section className="bg-white/90 border border-eco-mint rounded-3xl p-6 sm:p-8 shadow-xl max-w-7xl mx-auto text-eco-ink transition-all duration-300">
      
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-eco-mint pb-5 mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-eco-primary/10 text-eco-primary rounded-xl">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Admin/Moderator Console</h2>
            <p className="text-xs text-eco-muted">
              Đang đăng nhập: <span className="font-bold text-eco-primary">{user.email}</span> • Vai trò: <span className="bg-eco-primary/10 px-2 py-0.5 rounded text-[10px] font-extrabold">{user.role}</span>
            </p>
          </div>
        </div>
        
        {/* Refresh button */}
        <button
          onClick={() => fetchTabContent(activeTab)}
          disabled={loading}
          className="flex items-center justify-center space-x-1.5 px-4.5 py-2 text-xs font-bold text-eco-primary hover:text-white border border-eco-primary/20 hover:bg-eco-primary rounded-full transition-all duration-200 disabled:opacity-50 shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Global alert notifications */}
      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Navigation buttons */}
      <div className="flex flex-wrap border-b border-eco-mint mb-6">
        {[
          { id: 'overview', label: '📊 Tổng quan', icon: LayoutDashboard },
          { id: 'reviews', label: '💬 Đánh giá (UGC)', icon: MessageSquare },
          { id: 'tickets', label: '🎫 Vé xanh', icon: Ticket },
          { id: 'places', label: '📍 Địa điểm POI', icon: MapPin },
          { id: 'guides', label: '📖 Cẩm nang', icon: BookOpen },
          { id: 'vouchers', label: '🎁 Vouchers', icon: Gift },
          { id: 'audit_logs', label: '🕵️ Nhật ký kiểm toán', icon: FileText },
          { id: 'analytics', label: '📈 Thống kê truy cập', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setShowPlaceForm(false);
                setShowGuideForm(false);
                setShowVoucherForm(false);
              }}
              className={`flex items-center space-x-1.5 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 shrink-0 ${
                isActive
                  ? 'border-eco-primary text-eco-primary bg-eco-mint/30'
                  : 'border-transparent text-eco-muted hover:text-eco-primary hover:bg-eco-mint/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading && !stats && !reviews.length && !tickets.length && !places.length && !guides.length && !vouchers.length && !auditLogs.length ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-eco-primary mx-auto mb-3" />
          <p className="text-xs text-eco-muted font-bold">Đang tải dữ liệu kiểm trị...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    title: 'Reviews Chờ Duyệt', 
                    value: stats.pendingReviewsCount, 
                    color: 'text-amber-600 bg-amber-50 border-amber-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('reviews')
                  },
                  { 
                    title: 'Vé Chờ Kiểm Duyệt', 
                    value: stats.pendingTicketsCount, 
                    color: 'text-blue-600 bg-blue-50 border-blue-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('tickets')
                  },
                  { 
                    title: 'Voucher Active', 
                    value: stats.activeVouchersCount, 
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('vouchers')
                  },
                  { 
                    title: 'Voucher Hết Hàng', 
                    value: stats.outOfStockVouchersCount, 
                    color: 'text-red-600 bg-red-50 border-red-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('vouchers')
                  },
                  { 
                    title: 'Voucher Hết Hạn', 
                    value: stats.expiredVouchersCount, 
                    color: 'text-rose-600 bg-rose-50 border-rose-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('vouchers')
                  },
                  { 
                    title: 'Lượt Đổi Quà', 
                    value: stats.recentRedemptionsCount, 
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('vouchers')
                  },
                  { 
                    title: 'Tổng Điểm Phát Hành', 
                    value: stats.totalPointsIssued, 
                    color: 'text-eco-accentGreenDeep bg-eco-mint border-eco-primary/10 cursor-pointer hover:scale-[1.02]',
                    onClick: () => {
                      document.getElementById('recent-audit-logs-card')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  },
                  { 
                    title: 'Tổng Điểm Tiêu Thụ', 
                    value: stats.totalPointsSpent, 
                    color: 'text-orange-600 bg-orange-50 border-orange-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => {
                      document.getElementById('recent-audit-logs-card')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  },
                ].map((card, idx) => (
                  <div 
                    key={idx} 
                    onClick={card.onClick}
                    className={`p-4 border rounded-2xl flex flex-col justify-between shadow-sm hover-spring transition-all active:scale-95 duration-150 ${card.color}`}
                  >
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-eco-muted/70">{card.title}</span>
                    <span className="text-2xl sm:text-3xl font-black mt-2 font-mono">{card.value}</span>
                  </div>
                ))}
              </div>

              {/* Short Audit Log Timeline */}
              <div id="recent-audit-logs-card" className="border border-eco-mint rounded-2xl p-5 bg-white">
                <h3 className="text-sm font-extrabold text-eco-ink uppercase tracking-wider mb-4 border-b border-eco-mint pb-2">
                  🕵️ Hoạt động kiểm trị gần đây
                </h3>
                <div className="space-y-4">
                  {stats.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
                    stats.recentAuditLogs.map((log: any) => (
                      <div key={log.id} className="flex items-start space-x-3 text-xs border-l-2 border-eco-primary pl-3 py-1">
                        <div className="flex-1">
                          <p className="font-semibold text-eco-ink">{log.summary}</p>
                          <span className="text-[10px] text-eco-muted">
                            Tác nhân: <span className="font-bold">{log.actorRole}</span> • IP: {log.ipAddress || 'unknown'} • Lúc: {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-eco-muted py-2 text-center">Chưa có vết kiểm toán nào được ghi nhận.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-fade-in">
              {/* Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-eco-muted">Trạng thái:</span>
                {['pending', 'approved', 'rejected', 'all'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                      reviewFilter === st
                        ? 'bg-eco-primary text-white'
                        : 'bg-eco-mint text-eco-primary hover:bg-eco-primary hover:text-white'
                    }`}
                  >
                    {st === 'pending' ? 'Chờ duyệt' : st === 'approved' ? 'Đã duyệt' : st === 'rejected' ? 'Bị từ chối' : 'Tất cả'}
                  </button>
                ))}
              </div>

              {/* Review Input Note box */}
              <div className="bg-eco-mint/30 border border-eco-primary/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="text"
                  placeholder="Nhập ghi chú kiểm duyệt / lý do từ chối (tùy chọn)..."
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  className="flex-grow bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-eco-primary"
                />
                <span className="text-[10px] text-eco-muted text-right italic shrink-0">Note này sẽ lưu vào dữ liệu duyệt</span>
              </div>

              {/* Review Lists */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="border border-eco-mint rounded-2xl p-5 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold bg-eco-mint text-eco-primary px-2.5 py-0.5 rounded-full">
                            ⭐️ {rev.rating} sao
                          </span>
                          <span className="text-xs font-semibold text-eco-muted">
                            Người đăng: {rev.displayName}
                          </span>
                          <span className="text-[10px] text-eco-muted">• Lên lúc: {formatDate(rev.createdAt)}</span>
                        </div>
                        <p className="text-sm font-semibold text-eco-ink">{rev.content}</p>
                        <p className="text-xs text-eco-muted">
                          Mục tiêu đánh giá: <span className="font-extrabold text-eco-primary">{rev.target}</span>
                        </p>
                        
                        {/* Display Mod note */}
                        {rev.moderationNote && (
                          <div className="p-2.5 bg-eco-bgBeige/40 border border-eco-primary/5 rounded-xl text-xs text-eco-muted mt-2">
                            Ghi chú duyệt: <span className="italic text-eco-ink">{rev.moderationNote}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Status Badge */}
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border tracking-wider ${
                          rev.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : rev.status === 'rejected' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {rev.status === 'approved' ? 'Đã duyệt' : rev.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
                        </span>

                        {/* Actions */}
                        {rev.status === 'pending' && (
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleModerateReview(rev.id, 'approved')}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => handleModerateReview(rev.id, 'rejected')}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-eco-muted py-10 text-center bg-white border border-eco-mint rounded-2xl">
                    Không tìm thấy đánh giá nào có điều kiện này.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-4 animate-fade-in">
              {/* Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-eco-muted">Trạng thái:</span>
                {['pending', 'verified', 'rejected', 'manual_review', 'all'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                      ticketFilter === st
                        ? 'bg-eco-primary text-white'
                        : 'bg-eco-mint text-eco-primary hover:bg-eco-primary hover:text-white'
                    }`}
                  >
                    {st === 'pending' ? 'Chờ duyệt' : st === 'verified' ? 'Đã duyệt' : st === 'rejected' ? 'Bị từ chối' : st === 'manual_review' ? 'Duyệt thủ công' : 'Tất cả'}
                  </button>
                ))}
              </div>

              {/* Tickets Options Form Panel */}
              <div className="bg-eco-mint/30 border border-eco-primary/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold uppercase text-eco-muted">Điểm tặng (5 - 100):</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={ticketPoints}
                    onChange={(e) => setTicketPoints(parseInt(e.target.value, 10) || 20)}
                    className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-eco-primary font-bold"
                  />
                </div>
                <div className="flex flex-col space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-eco-muted">Ghi chú duyệt vé:</label>
                  <input
                    type="text"
                    placeholder="Lý do từ chối hoặc lưu ý khi duyệt vé..."
                    value={ticketNote}
                    onChange={(e) => setTicketNote(e.target.value)}
                    className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-eco-primary"
                  />
                </div>
              </div>

              {/* Ticket list */}
              <div className="space-y-4">
                {tickets.length > 0 ? (
                  tickets.map((t) => (
                    <div key={t.id} className="border border-eco-mint rounded-2xl p-5 bg-white shadow-sm flex flex-col md:flex-row gap-5">
                      {/* Ticket Thumbnail Safe Serving */}
                      <div className="w-full md:w-32 h-32 shrink-0 bg-eco-bgBeige rounded-xl overflow-hidden border border-eco-primary/10 flex items-center justify-center relative">
                        {brokenTickets[t.id] ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-[10px] text-center text-eco-muted font-bold p-3 leading-tight select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            <span>Ảnh vé không khả dụng</span>
                          </div>
                        ) : (
                          <img 
                            src={t.thumbnailUrl} 
                            alt="Eco Ticket" 
                            className="w-full h-full object-cover" 
                            onError={() => {
                              setBrokenTickets(prev => ({ ...prev, [t.id]: true }));
                            }}
                          />
                        )}
                      </div>

                      {/* Ticket Details */}
                      <div className="flex-grow space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.type === 'metro' 
                              ? 'bg-blue-100 text-blue-800' 
                              : t.type === 'bus' || t.type === 'ebus' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            🚌 {t.type}
                          </span>
                          <span className="font-extrabold text-eco-ink">Tuyến: {t.routeLabel || 'Tuyến xanh'}</span>
                          <span className="text-eco-muted">Ga: {t.stationName || 'N/A'}</span>
                        </div>
                        {brokenTickets[t.id] && (
                          <p className="text-[10px] font-bold text-amber-600 mt-1 italic">
                            ⚠️ Không thể hiển thị ảnh vé này.
                          </p>
                        )}
                        
                        <p className="text-[10px] text-eco-muted">Kích thước: {Math.round(t.sizeBytes / 1024)} KB • Ngày đi: {t.tripDate ? new Date(t.tripDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                        
                        <div className="bg-eco-mint/20 border border-eco-primary/5 rounded-xl p-2.5 mt-2 font-mono text-[10px] text-eco-muted max-h-20 overflow-y-auto">
                          <span className="font-bold text-eco-primary uppercase">OCR Text:</span> {t.ocrText || 'Không đọc được chữ'} (Status: {t.ocrStatus})
                        </div>

                        {t.reviewNote && (
                          <div className="p-2.5 bg-eco-bgBeige/40 border border-eco-primary/5 rounded-xl text-[10px] text-eco-muted mt-2">
                            Lý do: <span className="font-semibold text-eco-ink">{t.reviewNote}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-between items-end shrink-0 gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border tracking-wider ${
                          t.status === 'verified' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : t.status === 'rejected' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : t.status === 'manual_review'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t.status === 'verified' ? 'Đã duyệt' : t.status === 'rejected' ? 'Bị từ chối' : t.status === 'manual_review' ? 'Cần xem tay' : 'Chờ duyệt'}
                        </span>

                        {(t.status === 'pending' || t.status === 'manual_review') && (
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleModerateTicket(t.id, 'approved')}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => handleModerateTicket(t.id, 'rejected')}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-eco-muted py-10 text-center bg-white border border-eco-mint rounded-2xl">
                    Không tìm thấy vé xe nào có điều kiện này.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PLACES POI */}
          {activeTab === 'places' && (
            <div className="space-y-6 animate-fade-in">
              {/* Form toggles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-eco-muted">Bộ lọc:</span>
                  {['all', 'published', 'unpublished'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setPlaceFilter(st)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                        placeFilter === st
                          ? 'bg-eco-primary text-white'
                          : 'bg-eco-mint text-eco-primary hover:bg-eco-primary hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'Tất cả' : st === 'published' ? 'Đang hiện' : 'Đang ẩn'}
                    </button>
                  ))}
                </div>

                {!showPlaceForm && (
                  <button
                    onClick={() => {
                      setPlaceFormMode('create');
                      setPlaceData({
                        name: '',
                        slug: '',
                        category: 'cafe',
                        stationId: stations[0]?.id || '',
                        lat: 10.7712,
                        lng: 106.6976,
                        address: '',
                        shortDescription: '',
                        description: '',
                        district: 'Quận 1',
                        walkingMinutes: 5,
                        distanceMeters: 300,
                        priceLevel: 1,
                        tags: '',
                        highlights: '',
                        imageUrl: '',
                        featured: false,
                        isPublished: true
                      });
                      setShowPlaceForm(true);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold rounded-full transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm địa điểm</span>
                  </button>
                )}
              </div>

              {/* Places Creation/Update Inline Form */}
              {showPlaceForm && (
                <form onSubmit={handlePlaceSubmit} className="border border-eco-primary/20 rounded-2xl p-5 bg-eco-mint/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <h3 className="text-sm font-black uppercase text-eco-primary md:col-span-2 border-b border-eco-mint pb-2 flex items-center justify-between">
                    <span>{placeFormMode === 'create' ? '➕ Thêm Địa Điểm POI Mới' : '📝 Chỉnh Sửa Địa Điểm POI'}</span>
                    <button type="button" onClick={() => setShowPlaceForm(false)} className="text-eco-muted hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </h3>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Tên địa điểm *</label>
                    <input
                      type="text"
                      required
                      value={placeData.name}
                      onChange={(e) => setPlaceData({ ...placeData, name: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Slug (URL duy nhất) *</label>
                    <input
                      type="text"
                      required
                      value={placeData.slug}
                      onChange={(e) => setPlaceData({ ...placeData, slug: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Danh mục *</label>
                    <select
                      value={placeData.category}
                      onChange={(e) => setPlaceData({ ...placeData, category: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    >
                      <option value="cafe">Cà phê (Cafe)</option>
                      <option value="food">Ẩm thực (Food)</option>
                      <option value="shopping">Mua sắm (Shopping)</option>
                      <option value="service">Dịch vụ (Service)</option>
                      <option value="attraction">Giải trí (Attraction)</option>
                      <option value="study/work friendly">Làm việc/Học tập</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Ga liên kết *</label>
                    <select
                      value={placeData.stationId}
                      onChange={(e) => setPlaceData({ ...placeData, stationId: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    >
                      <option value="">-- Chọn ga tàu --</option>
                      {stations.map(s => (
                        <option key={s.id} value={s.id}>Ga {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Vĩ độ (Latitude) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={placeData.lat}
                      onChange={(e) => setPlaceData({ ...placeData, lat: parseFloat(e.target.value) || 0 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Kinh độ (Longitude) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={placeData.lng}
                      onChange={(e) => setPlaceData({ ...placeData, lng: parseFloat(e.target.value) || 0 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Quận/Huyện</label>
                    <input
                      type="text"
                      value={placeData.district}
                      onChange={(e) => setPlaceData({ ...placeData, district: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Địa chỉ</label>
                    <input
                      type="text"
                      value={placeData.address}
                      onChange={(e) => setPlaceData({ ...placeData, address: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Thời gian đi bộ (phút)</label>
                    <input
                      type="number"
                      value={placeData.walkingMinutes}
                      onChange={(e) => setPlaceData({ ...placeData, walkingMinutes: parseInt(e.target.value, 10) || 0 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Khoảng cách (mét)</label>
                    <input
                      type="number"
                      value={placeData.distanceMeters}
                      onChange={(e) => setPlaceData({ ...placeData, distanceMeters: parseFloat(e.target.value) || 0 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Mô tả ngắn *</label>
                    <input
                      type="text"
                      required
                      value={placeData.shortDescription}
                      onChange={(e) => setPlaceData({ ...placeData, shortDescription: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Mô tả chi tiết</label>
                    <textarea
                      value={placeData.description}
                      onChange={(e) => setPlaceData({ ...placeData, description: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none h-20"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Tags (cách nhau bằng dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="cafe, chill, wifi"
                      value={placeData.tags}
                      onChange={(e) => setPlaceData({ ...placeData, tags: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Highlights nổi bật (cách nhau bằng dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="View đẹp, Cà phê ngon"
                      value={placeData.highlights}
                      onChange={(e) => setPlaceData({ ...placeData, highlights: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Đường dẫn ảnh (URL)</label>
                    <input
                      type="text"
                      placeholder="/images/places/example.jpg"
                      value={placeData.imageUrl}
                      onChange={(e) => setPlaceData({ ...placeData, imageUrl: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-6 pt-3 md:col-span-2">
                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={placeData.featured}
                        onChange={(e) => setPlaceData({ ...placeData, featured: e.target.checked })}
                        className="rounded text-eco-primary focus:ring-eco-primary"
                      />
                      <span>Featured (Đặt làm địa điểm nổi bật)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={placeData.isPublished}
                        onChange={(e) => setPlaceData({ ...placeData, isPublished: e.target.checked })}
                        className="rounded text-eco-primary focus:ring-eco-primary"
                      />
                      <span>Publish (Xuất bản công khai)</span>
                    </label>
                  </div>

                  <div className="md:col-span-2 border-t border-eco-mint pt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPlaceForm(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {placeFormMode === 'create' ? 'Tạo mới' : 'Lưu cập nhật'}
                    </button>
                  </div>
                </form>
              )}

              {/* Compact Places list view */}
              <div className="space-y-3">
                {places.map((place) => (
                  <div key={place.id} className="border border-eco-mint rounded-2xl p-4 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-eco-ink text-sm">{place.name}</span>
                        <span className="text-[10px] font-bold bg-eco-mint text-eco-primary px-2 py-0.5 rounded">
                          {place.category}
                        </span>
                        <span className="text-[10px] text-eco-muted">Ga: {place.station?.name || 'N/A'}</span>
                      </div>
                      <p className="text-eco-muted mt-1 italic">{place.shortDescription}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleTogglePlacePublish(place)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border font-bold text-[10px] transition-colors ${
                          place.isPublished 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {place.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{place.isPublished ? 'Đang hiện' : 'Đang ẩn'}</span>
                      </button>

                      <button
                        onClick={() => openEditPlace(place)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-eco-mint hover:bg-eco-primary hover:text-white border border-eco-primary/20 text-eco-primary rounded-lg font-bold text-[10px] transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GUIDES */}
          {activeTab === 'guides' && (
            <div className="space-y-6 animate-fade-in">
              {/* Form toggles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-eco-muted">Bộ lọc:</span>
                  {['all', 'published', 'unpublished'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setGuideFilter(st)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                        guideFilter === st
                          ? 'bg-eco-primary text-white'
                          : 'bg-eco-mint text-eco-primary hover:bg-eco-primary hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'Tất cả' : st === 'published' ? 'Đang hiện' : 'Đang ẩn'}
                    </button>
                  ))}
                </div>

                {!showGuideForm && (
                  <button
                    onClick={() => {
                      setGuideFormMode('create');
                      setGuideData({
                        slug: '',
                        title: '',
                        excerpt: '',
                        content: '',
                        tags: '',
                        relatedStationId: '',
                        isPublished: true
                      });
                      setShowGuideForm(true);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold rounded-full transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm cẩm nang</span>
                  </button>
                )}
              </div>

              {/* Guides creation/update inline form */}
              {showGuideForm && (
                <form onSubmit={handleGuideSubmit} className="border border-eco-primary/20 rounded-2xl p-5 bg-eco-mint/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <h3 className="text-sm font-black uppercase text-eco-primary md:col-span-2 border-b border-eco-mint pb-2 flex items-center justify-between">
                    <span>{guideFormMode === 'create' ? '➕ Tạo Cẩm Nang Du Lịch Mới' : '📝 Chỉnh Sửa Cẩm Nang'}</span>
                    <button type="button" onClick={() => setShowGuideForm(false)} className="text-eco-muted hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </h3>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Tiêu đề cẩm nang *</label>
                    <input
                      type="text"
                      required
                      value={guideData.title}
                      onChange={(e) => setGuideData({ ...guideData, title: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Slug (URL duy nhất) *</label>
                    <input
                      type="text"
                      required
                      value={guideData.slug}
                      onChange={(e) => setGuideData({ ...guideData, slug: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Ga liên kết (tùy chọn)</label>
                    <select
                      value={guideData.relatedStationId}
                      onChange={(e) => setGuideData({ ...guideData, relatedStationId: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    >
                      <option value="">-- Không liên kết --</option>
                      {stations.map(s => (
                        <option key={s.id} value={s.id}>Ga {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Tags (dấu phẩy ngăn cách)</label>
                    <input
                      type="text"
                      placeholder="hướng dẫn, di chuyển xanh"
                      value={guideData.tags}
                      onChange={(e) => setGuideData({ ...guideData, tags: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Tóm tắt (excerpt) *</label>
                    <input
                      type="text"
                      required
                      value={guideData.excerpt}
                      onChange={(e) => setGuideData({ ...guideData, excerpt: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Nội dung cẩm nang (Plain text/Markdown thô, không HTML) *</label>
                    <textarea
                      required
                      value={guideData.content}
                      onChange={(e) => setGuideData({ ...guideData, content: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none h-40 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guideData.isPublished}
                        onChange={(e) => setGuideData({ ...guideData, isPublished: e.target.checked })}
                        className="rounded text-eco-primary focus:ring-eco-primary"
                      />
                      <span>Xuất bản ngay cẩm nang này</span>
                    </label>
                  </div>

                  <div className="md:col-span-2 border-t border-eco-mint pt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowGuideForm(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {guideFormMode === 'create' ? 'Tạo mới' : 'Lưu cập nhật'}
                    </button>
                  </div>
                </form>
              )}

              {/* Compact Guide list view */}
              <div className="space-y-3">
                {guides.map((g) => (
                  <div key={g.id} className="border border-eco-mint rounded-2xl p-4 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-extrabold text-eco-ink text-sm">{g.title}</span>
                      <p className="text-eco-muted mt-1 italic">{g.excerpt}</p>
                      <span className="text-[10px] text-eco-muted mt-2 block">Lúc tạo: {formatDate(g.createdAt)}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleGuidePublish(g)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border font-bold text-[10px] transition-colors ${
                          g.isPublished 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {g.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{g.isPublished ? 'Đang hiện' : 'Đang ẩn'}</span>
                      </button>

                      <button
                        onClick={() => openEditGuide(g)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-eco-mint hover:bg-eco-primary hover:text-white border border-eco-primary/20 text-eco-primary rounded-lg font-bold text-[10px] transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: VOUCHERS */}
          {activeTab === 'vouchers' && (
            <div className="space-y-6 animate-fade-in">
              {/* Form toggles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-eco-muted">Bộ lọc:</span>
                  {['all', 'active', 'inactive'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setVoucherFilter(st)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                        voucherFilter === st
                          ? 'bg-eco-primary text-white'
                          : 'bg-eco-mint text-eco-primary hover:bg-eco-primary hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'Tất cả' : st === 'active' ? 'Đang kích hoạt' : 'Đang khóa'}
                    </button>
                  ))}
                </div>

                {!showVoucherForm && (
                  <button
                    onClick={() => {
                      setVoucherFormMode('create');
                      setVoucherData({
                        name: '',
                        slug: '',
                        pointsCost: 100,
                        stockTotal: 50,
                        stockRemaining: 50,
                        perUserLimit: 2,
                        validFrom: '',
                        validUntil: '',
                        brandName: '',
                        category: 'food',
                        description: '',
                        terms: '',
                        imageUrl: '',
                        isActive: true,
                        encryptedCodes: ''
                      });
                      setShowVoucherForm(true);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold rounded-full transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo Voucher</span>
                  </button>
                )}
              </div>

              {/* Vouchers creation/update inline form */}
              {showVoucherForm && (
                <form onSubmit={handleVoucherSubmit} className="border border-eco-primary/20 rounded-2xl p-5 bg-eco-mint/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <h3 className="text-sm font-black uppercase text-eco-primary md:col-span-2 border-b border-eco-mint pb-2 flex items-center justify-between">
                    <span>{voucherFormMode === 'create' ? '➕ Tạo Voucher Quà Tặng Mới' : '📝 Chỉnh Sửa Voucher'}</span>
                    <button type="button" onClick={() => setShowVoucherForm(false)} className="text-eco-muted hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </h3>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Tên voucher quà tặng *</label>
                    <input
                      type="text"
                      required
                      value={voucherData.name}
                      onChange={(e) => setVoucherData({ ...voucherData, name: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Slug (URL duy nhất) *</label>
                    <input
                      type="text"
                      required
                      value={voucherData.slug}
                      onChange={(e) => setVoucherData({ ...voucherData, slug: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Thương hiệu cấp *</label>
                    <input
                      type="text"
                      required
                      value={voucherData.brandName}
                      onChange={(e) => setVoucherData({ ...voucherData, brandName: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Danh mục quà tặng *</label>
                    <select
                      value={voucherData.category}
                      onChange={(e) => setVoucherData({ ...voucherData, category: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    >
                      <option value="food">Đồ ăn (Food)</option>
                      <option value="drink">Thức uống (Drink)</option>
                      <option value="transit">Vận chuyển xanh (Transit)</option>
                      <option value="shopping">Mua sắm (Shopping)</option>
                      <option value="study">Học tập (Study)</option>
                      <option value="experience">Trải nghiệm (Experience)</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Giá trị điểm đổi (pointsCost) *</label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={voucherData.pointsCost}
                      onChange={(e) => setVoucherData({ ...voucherData, pointsCost: parseInt(e.target.value, 10) || 100 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Giới hạn đổi mỗi User *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={voucherData.perUserLimit}
                      onChange={(e) => setVoucherData({ ...voucherData, perUserLimit: parseInt(e.target.value, 10) || 1 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Tổng số lượng phát hành *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={voucherData.stockTotal}
                      onChange={(e) => setVoucherData({ ...voucherData, stockTotal: parseInt(e.target.value, 10) || 0 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Số lượng còn lại trong kho *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={voucherData.stockRemaining}
                      onChange={(e) => setVoucherData({ ...voucherData, stockRemaining: parseInt(e.target.value, 10) || 0 })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Ngày mở đổi (validFrom)</label>
                    <input
                      type="date"
                      value={voucherData.validFrom}
                      onChange={(e) => setVoucherData({ ...voucherData, validFrom: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Ngày hết hạn (validUntil)</label>
                    <input
                      type="date"
                      value={voucherData.validUntil}
                      onChange={(e) => setVoucherData({ ...voucherData, validUntil: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Mô tả phần quà *</label>
                    <input
                      type="text"
                      required
                      value={voucherData.description}
                      onChange={(e) => setVoucherData({ ...voucherData, description: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Điều khoản áp dụng</label>
                    <input
                      type="text"
                      value={voucherData.terms}
                      onChange={(e) => setVoucherData({ ...voucherData, terms: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Danh sách mã code phát hành (Ngăn cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="HL20-XYZ, PL30-QWE, MTR-111"
                      value={voucherData.encryptedCodes}
                      onChange={(e) => setVoucherData({ ...voucherData, encryptedCodes: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-eco-muted uppercase">Đường dẫn ảnh (URL)</label>
                    <input
                      type="text"
                      placeholder="/images/vouchers/highlands.png"
                      value={voucherData.imageUrl}
                      onChange={(e) => setVoucherData({ ...voucherData, imageUrl: e.target.value })}
                      className="bg-white border border-eco-primary/20 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voucherData.isActive}
                        onChange={(e) => setVoucherData({ ...voucherData, isActive: e.target.checked })}
                        className="rounded text-eco-primary focus:ring-eco-primary"
                      />
                      <span>Kích hoạt voucher (Mở đổi điểm)</span>
                    </label>
                  </div>

                  <div className="md:col-span-2 border-t border-eco-mint pt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowVoucherForm(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {voucherFormMode === 'create' ? 'Tạo mới' : 'Lưu cập nhật'}
                    </button>
                  </div>
                </form>
              )}

              {/* Compact Voucher list view */}
              <div className="space-y-3">
                {vouchers.map((v) => (
                  <div key={v.id} className="border border-eco-mint rounded-2xl p-4 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-eco-ink text-sm">{v.name}</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          {v.pointsCost || v.cost} điểm
                        </span>
                      </div>
                      <p className="text-eco-muted mt-1">
                        Kho: <span className="font-bold text-eco-ink">{v.stockRemaining}</span> / {v.stockTotal || v.quantity} • Hạn dùng: {v.validUntil ? formatDate(v.validUntil) : 'Vô thời hạn'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleVoucherActive(v)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border font-bold text-[10px] transition-colors ${
                          v.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {v.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{v.isActive ? 'Đang hoạt động' : 'Tạm dừng'}</span>
                      </button>

                      <button
                        onClick={() => openEditVoucher(v)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-eco-mint hover:bg-eco-primary hover:text-white border border-eco-primary/20 text-eco-primary rounded-lg font-bold text-[10px] transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4 animate-fade-in border border-eco-mint rounded-2xl p-5 bg-white max-h-[600px] overflow-y-auto">
              <h3 className="text-sm font-extrabold text-eco-ink uppercase tracking-wider mb-4 border-b border-eco-mint pb-2">
                🕵️ Nhật ký kiểm toán toàn bộ hệ thống
              </h3>
              
              <div className="space-y-4">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="border-l-2 border-eco-primary pl-3 py-1.5 space-y-1 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-eco-muted gap-1 text-[10px]">
                        <span>Tác nhân: <span className="font-extrabold text-eco-ink">{log.actorRole}</span> ({log.actorUserId || 'N/A'})</span>
                        <span>Lúc: {formatDate(log.createdAt)}</span>
                      </div>
                      <p className="font-bold text-eco-ink text-sm mt-1">{log.summary}</p>
                      <div className="text-[10px] text-eco-muted">
                        Đối tượng: <span className="font-semibold">{log.entityType}</span> (ID: {log.entityId || 'N/A'}) • IP: {log.ipAddress || 'local'}
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="bg-eco-mint/10 border border-eco-mint p-2.5 rounded-xl text-[9px] text-eco-muted overflow-x-auto max-w-full font-mono mt-1.5">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-eco-muted py-10 text-center">Chưa có vết kiểm toán nào được ghi nhận.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: ANALYTICS (YÊU CẦU MỚI) */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { 
                    title: 'Tổng Lượt Truy Cập (Views)', 
                    value: analyticsData.totalPageViews, 
                    color: 'text-eco-accentGreenDeep bg-eco-mint border-eco-primary/10 cursor-pointer',
                    onClick: () => {
                      document.getElementById('recent-access-logs-table')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  },
                  { 
                    title: 'Khách Duy Nhất (Unique IPs)', 
                    value: analyticsData.uniqueVisitors, 
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-200 cursor-pointer',
                    onClick: () => {
                      document.getElementById('recent-access-logs-table')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  },
                  { 
                    title: 'Tài Khoản Người Dùng', 
                    value: analyticsData.totalUsers, 
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200 cursor-pointer hover:scale-[1.02]',
                    onClick: openUsersListModal
                  },
                  { 
                    title: 'Hóa Đơn Lộ Trình Đã Tạo', 
                    value: analyticsData.totalRouteSearches, 
                    color: 'text-blue-600 bg-blue-50 border-blue-200 cursor-pointer hover:scale-[1.02]',
                    onClick: openRoutesListModal
                  },
                  { 
                    title: 'Vé Xanh Tải Lên (Duyệt/Tổng)', 
                    value: `${analyticsData.ticketStats.verified}/${analyticsData.ticketStats.total}`, 
                    color: 'text-amber-600 bg-amber-50 border-amber-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('tickets')
                  },
                  { 
                    title: 'Số Voucher Đã Đổi', 
                    value: analyticsData.totalRedemptions, 
                    color: 'text-rose-600 bg-rose-50 border-rose-200 cursor-pointer hover:scale-[1.02]',
                    onClick: () => setActiveTab('vouchers')
                  },
                ].map((card, idx) => (
                  <div 
                    key={idx} 
                    onClick={card.onClick}
                    className={`p-5 border rounded-2xl flex flex-col justify-between shadow-sm hover-spring transition-all active:scale-95 duration-150 ${card.color}`}
                  >
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-eco-muted/70">{card.title}</span>
                    <span className="text-2xl sm:text-3xl font-black mt-2 font-mono">{card.value}</span>
                  </div>
                ))}
              </div>

              {/* Access Logs Timeline */}
              <div id="recent-access-logs-table" className="border border-eco-mint rounded-2xl p-5 bg-white">
                <h3 className="text-sm font-extrabold text-eco-ink uppercase tracking-wider mb-4 border-b border-eco-mint pb-2">
                  📈 Nhật ký truy cập gần đây (Thời gian thực)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-eco-mint text-eco-muted font-bold">
                        <th className="py-2">Trang truy cập</th>
                        <th className="py-2">Người dùng</th>
                        <th className="py-2">Thiết bị</th>
                        <th className="py-2">Trình duyệt</th>
                        <th className="py-2 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-eco-mint/50">
                      {analyticsData.recentAccessLogs && analyticsData.recentAccessLogs.length > 0 ? (
                        analyticsData.recentAccessLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-eco-soft/40 transition-colors">
                            <td className="py-2.5 font-semibold text-eco-primary font-mono">{log.path}</td>
                            <td className="py-2.5">
                              {log.userEmail !== 'Khách vãng lai' ? (
                                <span className="bg-eco-primary/10 text-eco-primary px-2 py-1 rounded text-[10px] font-extrabold border border-eco-primary/20">
                                  👤 {log.userEmail}
                                </span>
                              ) : (
                                <span className="text-eco-muted/70 italic text-[11px]">Khách vãng lai</span>
                              )}
                            </td>
                            <td className="py-2.5">{log.device}</td>
                            <td className="py-2.5">
                              <span className="bg-eco-mint text-eco-primary px-2 py-0.5 rounded text-[10px] font-bold">
                                {log.browser}
                              </span>
                            </td>
                            <td className="py-2.5 text-right text-eco-muted">{formatDate(log.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-eco-muted">Chưa có lượt truy cập nào được ghi nhận.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG (RENDER PORTAL DƯỚI BODY) */}
      {mounted && showUsersModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-eco-mint rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-eco-mint flex items-center justify-between bg-eco-soft/30">
              <div className="flex items-center space-x-2">
                <span className="text-xl">👥</span>
                <div>
                  <h3 className="text-md font-black uppercase text-eco-ink">Thành viên EcoTransit ({usersList.length})</h3>
                  <p className="text-[10px] text-eco-muted">Danh sách tài khoản đăng ký trên hệ thống</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUsersModal(false)}
                className="p-1.5 hover:bg-eco-mint rounded-full text-eco-muted hover:text-eco-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Box */}
            <div className="p-4 border-b border-eco-mint bg-white">
              <input 
                type="text" 
                placeholder="Tìm kiếm tài khoản bằng email..." 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-eco-primary"
              />
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-grow overflow-y-auto">
              {modalLoading ? (
                <div className="py-10 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-eco-primary mx-auto mb-2" />
                  <p className="text-xs text-eco-muted font-bold">Đang tải danh sách người dùng...</p>
                </div>
              ) : (
                <div className="overflow-x-auto px-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-eco-mint text-eco-muted font-bold">
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Vai trò</th>
                        <th className="pb-2 text-center">Số dư Điểm</th>
                        <th className="pb-2 text-right">Ngày tham gia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-eco-mint/30">
                      {usersList
                        .filter(u => u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-eco-soft/20">
                            <td className="py-3 font-semibold text-eco-ink font-mono">{u.email}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                u.role === 'ADMIN' 
                                  ? 'bg-red-50 text-red-700 border border-red-200' 
                                  : u.role === 'MODERATOR' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'bg-eco-mint text-eco-primary'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 text-center font-extrabold text-eco-primary font-mono">{u.pointsBalanceCache}</td>
                            <td className="py-3 text-right text-eco-muted">{formatDate(u.createdAt)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-eco-mint bg-eco-soft/20 flex justify-end">
              <button 
                onClick={() => setShowUsersModal(false)}
                className="px-5 py-2 bg-eco-primary text-white text-xs font-bold rounded-xl hover:bg-eco-primaryDeep transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: DANH SÁCH HÓA ĐƠN LỘ TRÌNH ĐÃ TẠO (RENDER PORTAL DƯỚI BODY) */}
      {mounted && showRoutesModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-eco-mint rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-eco-mint flex items-center justify-between bg-eco-soft/30">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🗺️</span>
                <div>
                  <h3 className="text-md font-black uppercase text-eco-ink">Lộ trình xanh đã tạo ({routesList.length})</h3>
                  <p className="text-[10px] text-eco-muted">Danh sách các lộ trình được người dùng tìm kiếm gần đây</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRoutesModal(false)}
                className="p-1.5 hover:bg-eco-mint rounded-full text-eco-muted hover:text-eco-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Box */}
            <div className="p-4 border-b border-eco-mint bg-white">
              <input 
                type="text" 
                placeholder="Tìm kiếm theo điểm đi / điểm đến / biệt danh..." 
                value={routeSearchQuery}
                onChange={(e) => setRouteSearchQuery(e.target.value)}
                className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-eco-primary"
              />
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-grow overflow-y-auto">
              {modalLoading ? (
                <div className="py-10 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-eco-primary mx-auto mb-2" />
                  <p className="text-xs text-eco-muted font-bold">Đang tải danh sách lộ trình...</p>
                </div>
              ) : (
                <div className="overflow-x-auto px-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-eco-mint text-eco-muted font-bold">
                        <th className="pb-2">Biệt danh</th>
                        <th className="pb-2">Điểm xuất phát</th>
                        <th className="pb-2">Điểm kết thúc</th>
                        <th className="pb-2 text-center">Thời gian đi</th>
                        <th className="pb-2 text-center">Điểm Xanh</th>
                        <th className="pb-2 text-right">Tạo lúc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-eco-mint/30">
                      {routesList
                        .filter(r => 
                          r.originLabel.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
                          r.destinationLabel.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
                          (r.nickname || 'Ẩn danh').toLowerCase().includes(routeSearchQuery.toLowerCase())
                        )
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-eco-soft/20">
                            <td className="py-3 font-semibold text-eco-ink">{r.nickname || 'Ẩn danh'}</td>
                            <td className="py-3 max-w-[150px] truncate" title={r.originLabel}>{r.originLabel}</td>
                            <td className="py-3 max-w-[150px] truncate" title={r.destinationLabel}>{r.destinationLabel}</td>
                            <td className="py-3 text-center">{r.durationMinutes} phút</td>
                            <td className="py-3 text-center font-extrabold text-emerald-600 font-mono">+{r.greenScore || 0}</td>
                            <td className="py-3 text-right text-eco-muted">{formatDate(r.createdAt)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-eco-mint bg-eco-soft/20 flex justify-end">
              <button 
                onClick={() => setShowRoutesModal(false)}
                className="px-5 py-2 bg-eco-primary text-white text-xs font-bold rounded-xl hover:bg-eco-primaryDeep transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </section>
  );
}
