import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

import { Mail, Inbox, Send, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const EmailInbox = ({ onBack }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [emailToDelete, setEmailToDelete] = useState(null); 

  // Load emails
  useEffect(() => {
    loadEmails();
  }, [activeTab]);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'inbox' ? '/api/emails/inbox' : '/api/emails/sent';
      const response = await fetch(endpoint);
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error loading emails:', error);
    }
    setLoading(false);
  };

  // Open email detail
  const openEmail = async (email) => {
    try {
      const response = await fetch(`/api/emails/${email.id}`);
      const data = await response.json();
      setSelectedEmail(data.email);
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  // Approve INERTIA ROUTER
  const handleApprove = async () => {
  if (!confirm('Setujui pengajuan ini?')) return;

  setProcessing(true);

  try {
    console.log('Deleting email:', selectedEmail.id);
    const res = await fetch(`/api/emails/${selectedEmail.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',

       /* 'X-CSRF-TOKEN': document
          .querySelector('meta[name="csrf-token"]')
          .getAttribute('content'),

          */
      },
    });

    console.log('Response status:', res.status);

    if (!res.ok) {
      const errorData = await res.json(); 
      console.error(' Error response:', errorData);      

      throw new Error('Approve gagal' );
    }

    const data = await res.json();
    console.log('success response:', data)
    //console.error('Error response:', errorData);
    alert(data.message || 'Pengajuan berhasil disetujui');

    setSelectedEmail(null);
    loadEmails(); // refresh inbox

  } catch (err) {
    console.error('Approve error:', err); 
   // console.error(err);
    alert('Terjadi kesalahan saat approve');
  } finally {
    setProcessing(false);
  }
};


  
  // Reject INERTIA ROUTER
    const handleReject = async () => {
  if (!rejectReason.trim()) {
    alert('Alasan penolakan harus diisi!');
    return;
  }

  setProcessing(true);

  try {
    const res = await fetch(`/api/emails/${selectedEmail.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        /*
        'X-CSRF-TOKEN': document
          .querySelector('meta[name="csrf-token"]')
          .getAttribute('content'),
          */
      },
      body: JSON.stringify({
        alasan_penolakan: rejectReason,
      }),
    });

    if (!res.ok) {
      throw new Error('Reject gagal');
    }

    const data = await res.json();

    alert(data.message || 'Pengajuan berhasil ditolak');

    setShowRejectModal(false);
    setRejectReason('');
    setSelectedEmail(null);
    loadEmails();

  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat reject');
  } finally {
    setProcessing(false);
  }
};




  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  //handle delelte email 
   const handleDeleteEmail = async (emailId, event) => {
    
    if (event) {
      event.stopPropagation();
    }

    if (!confirm('Hapus email ini?')) return;

  try {
    const res = await fetch(`/api/emails/${emailId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', 
      },
    });

    if (!res.ok) {
      throw new Error('Gagal menghapus email');
    }
   
     const data = await res.json();
    alert(data.message || 'Email berhasil dihapus');

    // Refresh list
    loadEmails();

    

    if (selectedEmail && selectedEmail.id === emailId) {
      setSelectedEmail(null);
    }

  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat menghapus email');
  }
};
    


  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
          <Clock size={12} />
          Pending
        </span>;
      case 'approved':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <CheckCircle size={12} />
          Disetujui
        </span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          <XCircle size={12} />
          Ditolak
        </span>;
      default:
        return null;
    }
  };

  // Email List View
  
  if (!selectedEmail) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <Mail className="text-blue-600" size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Email Internal</h1>
                  <p className="text-sm text-slate-500">Sistem approval pengeluaran</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === 'inbox'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Inbox size={18} />
                Inbox
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {emails.filter(e => !e.is_read).length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === 'sent'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Send size={18} />
                Sent
              </button>
            </div>
          </div>

          {/* Email List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
  {loading ? (
    <div className="p-12 text-center text-slate-400">
      <Mail className="mx-auto mb-3 animate-pulse" size={48} />
      <p>Memuat email...</p>
    </div>
  ) : emails.length === 0 ? (
    <div className="p-12 text-center text-slate-400">
      <Mail className="mx-auto mb-3" size={48} />
      <p className="font-medium">Belum ada email</p>
      <p className="text-sm mt-1">
        {activeTab === 'inbox' ? 'Inbox kosong' : 'Belum ada email terkirim'}
      </p>
    </div>
  ) : (
    <div className="divide-y divide-slate-200">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`p-6 hover:bg-slate-50 transition group ${
            !email.is_read && activeTab === 'inbox' ? 'bg-blue-50/50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            {/* LEFT CONTENT - CLICKABLE */}
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => openEmail(email)}
            >
              <div className="flex items-center gap-3 mb-2">
                {!email.is_read && activeTab === 'inbox' && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
                <h3
                  className={`font-semibold truncate ${
                    !email.is_read && activeTab === 'inbox'
                      ? 'text-blue-600'
                      : 'text-slate-800'
                  }`}
                >
                  {email.subject}
                </h3>
              </div>

              <p className="text-sm text-slate-600 mb-2">
                {activeTab === 'inbox'
                  ? `Dari: ${email.sender?.name || 'Unknown'}`
                  : `Kepada: ${email.receiver?.name || 'Unknown'}`}
              </p>

              <p className="text-sm text-slate-500 line-clamp-2">
                {email.body?.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
            </div>

            {/* RIGHT ACTION */}
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {formatDate(email.created_at)}
              </span>

              <div className="flex items-center gap-2">
                {email.status && getStatusBadge(email.status)}
                
                {/* DELETE BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEmail(email.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                  title="Hapus email"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  
             // 
            )}
          </div>
        </div>
      </div>
    );
  }

  // Email Detail View
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedEmail(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
            
            {selectedEmail.status && getStatusBadge(selectedEmail.status)}

            {/* TOMBOL DELETE DI DETAIL */}
              <button
                onClick={() => handleDeleteEmail(selectedEmail.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                <Trash2 size={18} />
                Hapus Email
              </button>
            </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {selectedEmail.subject}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>
              <strong>Dari:</strong> {selectedEmail.sender?.name || 'Unknown'}
            </span>
            <span>•</span>
            <span>
              <strong>Kepada:</strong> {selectedEmail.receiver?.name || 'Unknown'}
            </span>
            <span>•</span>
            <span>{formatDate(selectedEmail.created_at)}</span>
          </div>
        </div>

        {/* Email Body */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
          />
        </div>

        {/* Action Buttons */}
        {selectedEmail.type === 'approval_request' && 
         selectedEmail.status === 'pending' && 
         activeTab === 'inbox' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Tindakan</h3>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={processing}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
                  processing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <CheckCircle size={20} />
                {processing ? 'Memproses...' : 'Setujui Pengajuan'}
              </button>
              
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
                  processing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <XCircle size={20} />
                Tolak Pengajuan
              </button>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Alasan Penolakan
              </h3>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                rows={5}
                disabled={processing}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className={`flex-1 px-6 py-3 rounded-lg transition font-semibold ${
                    processing
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {processing ? 'Memproses...' : 'Tolak'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  disabled={processing}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInbox;