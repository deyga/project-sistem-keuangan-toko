import { router } from '@inertiajs/react';

import { ShieldAlert, ArrowLeft, Home, Mail, Lock, UserX, AlertTriangle } from 'lucide-react';

export default function Error403() {
  
  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-2xl w-full relative z-10">

        {/* Main Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-red-100">
          
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-red-300 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-red-300 rounded-br-3xl"></div>

          {/* Animated Icon */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-3xl opacity-30 animate-ping"></div>
            <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl hover:shadow-red-300 transition-all duration-300 hover:scale-110">
              <ShieldAlert className="text-white animate-bounce" size={64} style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Error Code Gradient Animation */}
          <div className="mb-6">
            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 mb-2" style={{ 
              backgroundSize: '200% auto',
              animation: 'gradientShift 3s ease infinite'
            }}>
              403
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 mx-auto rounded-full animate-pulse" style={{ backgroundSize: '200% auto' }}></div>
          </div>

          {/* Message */}
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
            <Lock className="text-red-500 animate-pulse" size={28} />
            Akses Ditolak
          </h2>
          <p className="text-slate-600 text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk mengakses{' '}
            <span className="font-bold text-red-600">Pengaturan → Backup Data</span>.
            <br />
            Fitur ini hanya tersedia untuk{' '}
            <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
              <UserX size={16} />
              Administrator
            </span>
          </p>

          {/* Info Box with Icons */}
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="font-bold text-red-800 mb-5 flex items-center gap-2 text-lg border-b border-red-200 pb-3">
              <AlertTriangle size={22} className="animate-pulse" />
              Detail Akses
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-red-100">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm mb-1">Role Anda Saat Ini</p>
                  <p className="text-blue-600 font-bold text-lg">Kasir</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-red-100">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm mb-1">Role yang Diperlukan</p>
                  <p className="text-red-600 font-bold text-lg">Administrator</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-red-100">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm mb-1">Solusi</p>
                  <p className="text-slate-600 text-sm">Hubungi administrator sistem untuk mendapatkan akses ke fitur Backup Data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleBackToDashboard}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-300/50 font-semibold transform hover:scale-105 hover:-translate-y-1"
            >
              <Home size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              Kembali ke Dashboard
            </button>
            
            <button
              onClick={handleGoBack}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 shadow-md hover:shadow-lg font-semibold transform hover:scale-105 hover:-translate-y-1"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
              Halaman Sebelumnya
            </button>
          </div>

          {/* Contact Admin */}
          <div className="pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-sm mb-3 font-medium">Butuh bantuan lebih lanjut?</p>
            <a 
              href="mailto:admin@example.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-blue-600 hover:text-blue-700 font-medium text-sm rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <Mail size={18} className="animate-pulse" />
              Hubungi Administrator
            </a>
          </div>

        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 space-y-2 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator sistem
          </p>
          <p className="text-slate-400 text-xs font-mono">
            Error Code: 403 | Unauthorized Access to Backup Data Settings
          </p>
        </div>

      </div>

      {/* Add inline style for gradient animation */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}