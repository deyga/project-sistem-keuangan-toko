<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ApprovalRequest;
use App\Models\TransaksiPengeluaran;

class ApprovalController extends Controller
{
    public function index()
    {
        $approvals = ApprovalRequest::with(['user', 'kategori'])
            ->orderBy('tanggal_pengajuan', 'desc')
            ->get();

        return response()->json($approvals);
    }

    // Approve request
    public function approve(Request $request, $id)
    {
        
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '❌ Hanya Admin yang bisa approve!'
            ], 403);
        }
        
        $approval = ApprovalRequest::findOrFail($id);
        
        // Update status approval
        $approval->update([
            'status' => 'approved',
            'tanggal_approval' => now()
        ]);

        // Simpan ke transaksi pengeluaran
        TransaksiPengeluaran::create([
            'user_id' => $approval->user_id,
            'jumlah' => $approval->jumlah,
            'tanggal' => $approval->tanggal,
            'keterangan' => $approval->keterangan,
            'kategori_id' => $approval->kategori_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil disetujui'
        ]);
    }

    // Reject request
    public function reject(Request $request, $id)
    {
        
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '❌ Hanya Admin yang bisa reject!'
            ], 403);
        }
        
        $validated = $request->validate([
            'alasan_penolakan' => 'required|string'
        ]);

        $approval = ApprovalRequest::findOrFail($id);
        
        $approval->update([
            'status' => 'rejected',
            'tanggal_approval' => now(),
            'alasan_penolakan' => $validated['alasan_penolakan']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil ditolak'
        ]);
    }
}