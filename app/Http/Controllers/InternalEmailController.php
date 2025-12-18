<?php

namespace App\Http\Controllers;

use App\Models\InternalEmail;
use App\Models\ApprovalRequest;
use App\Models\TransaksiPengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InternalEmailController extends Controller
{ 
    public function healtApi()
    {
        return response()->json([
            'message' => 'Internal Email API OK'
        ]);
    }
 
    public function inboxApi()
    {
        try {
            $emails = InternalEmail::where('to_user_id', Auth::id())
                ->with(['sender', 'approvalRequest.kategori'])
                ->where('deleted_by_receiver', false) 
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'emails' => $emails
            ]);
        } catch (\Exception $e) {
            Log::error('Error in inboxApi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sentApi()
    {
        try {
            $emails = InternalEmail::where('from_user_id', Auth::id())
                ->with(['receiver', 'approvalRequest.kategori'])
                ->where('deleted_by_sender', false)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'emails' => $emails
            ]);
        } catch (\Exception $e) {
            Log::error('Error in sentApi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function unreadCount()
    {
        $count = InternalEmail::where('to_user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
       
    //show API 
      public function showApi($id)
{
    try {
        $email = InternalEmail::with(['sender', 'receiver', 'approvalRequest.kategori'])
            ->findOrFail($id);
        
        // Mark as read jika user adalah penerima
        if ($email->to_user_id == auth()->id() && !$email->is_read) {
            $email->update(['is_read' => true]);
        }
        
        return response()->json([
            'success' => true,
            'email' => $email
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error in showApi: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 404);
    }
}




    public function approve($id)
    {
        try {
            $email = InternalEmail::findOrFail($id);
            
            // CEK ROLE - HANYA ADMIN
            if (auth()->user()->role !== 'admin') {
                Log::warning('Non-admin trying to approve', [
                    'user_id' => auth()->id(),
                    'user_role' => auth()->user()->role
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => '❌ Hanya Admin yang bisa approve!'
                ], 403);
            }
            
            $approval = ApprovalRequest::find($email->approval_request_id);
            
            if (!$approval) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approval request tidak ditemukan'
                ], 404);
            }
            
            $approval->update([
                'status' => 'approved',
                'tanggal_approval' => now()
            ]);
            
            TransaksiPengeluaran::create([
                'user_id' => $approval->user_id,
                'jumlah' => $approval->jumlah,
                'tanggal' => $approval->tanggal,
                'keterangan' => $approval->keterangan,
                'kategori_id' => $approval->kategori_id
            ]);
            
            $email->update([
                'status' => 'approved',
                'is_read' => true
            ]);
            
            InternalEmail::create([
                'from_user_id' => auth()->id(),
                'to_user_id' => $email->from_user_id,
                'subject' => '✅ DISETUJUI - ' . $email->subject,
                'body' => "
                    <div style='font-family: Arial, sans-serif;'>
                        <p><strong>Pengajuan Anda DISETUJUI</strong></p>
                        <hr>
                        <p>Pengajuan pengeluaran Anda telah disetujui oleh Admin.</p>
                        <p>Transaksi telah dicatat dalam sistem.</p>
                        <p><em>Disetujui oleh: " . auth()->user()->name . "</em></p>
                    </div>
                ",
                'type' => 'approval_response',
                'approval_request_id' => $approval->id,
                'status' => 'approved',
                'is_read' => false
            ]);
            
            Log::info('Approval approved', [
                'admin_id' => auth()->id(),
                'approval_id' => $approval->id
            ]);

            return response()->json([
                'success' => true,
                'message' => '✅ Pengajuan berhasil disetujui'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in approve: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        try {
            $email = InternalEmail::findOrFail($id);
            
            // CEK ROLE - HANYA ADMIN
            if (auth()->user()->role !== 'admin') {
                Log::warning('Non-admin trying to reject', [
                    'user_id' => auth()->id(),
                    'user_role' => auth()->user()->role
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => '❌ Hanya Admin yang bisa reject!'
                ], 403);
            }
            
            $validated = $request->validate([
                'alasan_penolakan' => 'required|string'
            ]);
            
            $alasan = $validated['alasan_penolakan'];
            
            $approval = ApprovalRequest::find($email->approval_request_id);
            
            if (!$approval) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approval request tidak ditemukan'
                ], 404);
            }
            
            $approval->update([
                'status' => 'rejected',
                'tanggal_approval' => now(),
                'alasan_penolakan' => $alasan
            ]);
            
            $email->update([
                'status' => 'rejected',
                'is_read' => true
            ]);
            
            InternalEmail::create([
                'from_user_id' => auth()->id(),
                'to_user_id' => $email->from_user_id,
                'subject' => '❌ DITOLAK - ' . $email->subject,
                'body' => "
                    <div style='font-family: Arial, sans-serif;'>
                        <p><strong>Pengajuan Anda DITOLAK</strong></p>
                        <hr>
                        <p><strong>Alasan Penolakan:</strong></p>
                        <p>{$alasan}</p>
                        <p><em>Ditolak oleh: " . auth()->user()->name . "</em></p>
                    </div>
                ",
                'type' => 'approval_response',
                'approval_request_id' => $approval->id,
                'status' => 'rejected',
                'is_read' => false
            ]);
            
            Log::info('Approval rejected', [
                'admin_id' => auth()->id(),
                'approval_id' => $approval->id,
                'reason' => $alasan
            ]);
            
            return response()->json([
                'success' => true,
                'message' => '❌ Pengajuan berhasil ditolak'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in reject: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    //email delete
    public function deleteEmail($id)
   {
    try {
        $email = InternalEmail::findOrFail($id);
        
        
        

        if ($email->from_user_id !== auth()->id() && $email->to_user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak berhak menghapus email ini'
            ], 403);
        }
        
        
        
        $userId = auth()->id();
        
        if ($email->from_user_id == $userId) {
            $email->update(['deleted_by_sender' => true]);
            Log::info('Email marked as deleted by sender', [
                'email_id' => $email->id,
                'user_id' => $userId
            ]);
        }
        
        if ($email->to_user_id == $userId) {
            $email->update(['deleted_by_receiver' => true]);
            Log::info('Email marked as deleted by receiver', [
                'email_id' => $email->id,
                'user_id' => $userId
            ]);
        }
        
        // hapus permanen

        if ($email->deleted_by_sender && $email->deleted_by_receiver) {
            $email->delete();
            Log::info('Email permanently deleted', ['email_id' => $email->id]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Email berhasil dihapus'
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error in deleteEmail: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan: ' . $e->getMessage()
        ], 500);
    }
  }
}