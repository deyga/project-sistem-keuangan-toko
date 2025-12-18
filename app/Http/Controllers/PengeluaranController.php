<?php

namespace App\Http\Controllers;

use App\Models\TransaksiPengeluaran;
use App\Models\KategoriPengeluaran;
use App\Models\ApprovalRequest;
use App\Models\InternalEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    public function index()
    {
        return Inertia::render('Pengeluaran/Index', [
            'transaksiList' => TransaksiPengeluaran::with('kategori')
                ->latest('tanggal')
                ->get(),
            'kategoriList' => KategoriPengeluaran::orderBy('nama_kategori')->get()
        ]);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('=== START STORE PENGELUARAN ===');
            
            $validated = $request->validate([
               'jumlah' => 'required|numeric|min:0',
               'tanggal' => 'required|date',
               'keterangan' => 'required|string|max:255',
               'kategori_id' => 'required|exists:kategori_pengeluaran,id',
            ]);

            \Log::info('Validation passed');

            $jumlah = $validated['jumlah'];
            $userRole = auth()->user()->role;
            
            \Log::info('Input pengeluaran', [
                'user_id' => auth()->id(),
                'user_role' => $userRole,
                'jumlah' => $jumlah,
                'kategori_id' => $validated['kategori_id']
            ]);

            $kategori = KategoriPengeluaran::find($validated['kategori_id']);
            \Log::info('Kategori found: ' . ($kategori ? $kategori->nama_kategori : 'NOT FOUND'));

            // ADMIN BYPASS APPROVAL - Langsung simpan

            $userRole = auth()->user()->role;

            \Log::info('User role:', ['role' => $userRole]);

            if ($userRole === 'admin') {
                \Log::info('User is ADMIN - bypassing approval, saving directly...');
                
                TransaksiPengeluaran::create([
                    'user_id' => auth()->id(),
                    'jumlah' => $validated['jumlah'],
                    'tanggal' => $validated['tanggal'],
                    'keterangan' => $validated['keterangan'],
                    'kategori_id' => $validated['kategori_id'],
                ]);

                \Log::info('=== ADMIN DIRECT SAVE COMPLETED ===');

                return redirect()->back()->with('success', 'Pengeluaran berhasil disimpan (Admin)');
            }

            //approval
            if ($jumlah >= 10000000) {
                \Log::info('KASIR - Jumlah >= 10 juta, creating approval request...');
                
                try {
                    // Simpan ke approval_requests
                    $approval = ApprovalRequest::create([
                        'user_id' => auth()->id(),
                        'jumlah' => $validated['jumlah'],
                        'tanggal' => $validated['tanggal'],
                        'keterangan' => $validated['keterangan'],
                        'kategori_id' => $validated['kategori_id'],
                        'status' => 'pending',
                        'tanggal_pengajuan' => now()
                    ]);

                    \Log::info('Approval created: ID=' . $approval->id);
                    
                } catch (\Exception $e) {
                    \Log::error('FAILED to create approval!');
                    \Log::error('Error: ' . $e->getMessage());
                    
                    return redirect()->back()->with('error', 'Gagal membuat approval: ' . $e->getMessage());
                }

                // Cari admin
                $admin = User::where('role', 'admin')->first();
                
                if (!$admin) {
                    \Log::error('❌ Admin NOT FOUND!');
                    return redirect()->back()->with('error', 'Admin tidak ditemukan.');
                }
                
                \Log::info('Admin found: ' . $admin->name);

                try {
                    // Kirim email internal ke admin
                    $email = InternalEmail::create([
                        'from_user_id' => auth()->id(),
                        'to_user_id' => $admin->id,
                        'subject' => 'Approval Pengeluaran - Rp ' . number_format($jumlah, 0, ',', '.'),
                        'body' => "
                            <div style='font-family: Arial, sans-serif;'>
                                <h3 style='color: #1e40af;'>Pengajuan Pengeluaran Memerlukan Approval</h3>
                                <hr style='border: 1px solid #e5e7eb;'>
                                <table style='width: 100%; margin: 20px 0;'>
                                    <tr>
                                        <td style='padding: 8px 0;'><strong>Dari:</strong></td>
                                        <td style='padding: 8px 0;'>" . auth()->user()->name . " (Kasir)</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0;'><strong>Jumlah:</strong></td>
                                        <td style='padding: 8px 0;'>Rp " . number_format($jumlah, 0, ',', '.') . "</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0;'><strong>Kategori:</strong></td>
                                        <td style='padding: 8px 0;'>{$kategori->nama_kategori}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0;'><strong>Tanggal:</strong></td>
                                        <td style='padding: 8px 0;'>{$validated['tanggal']}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; vertical-align: top;'><strong>Keterangan:</strong></td>
                                        <td style='padding: 8px 0;'>{$validated['keterangan']}</td>
                                    </tr>
                                </table>
                                <hr style='border: 1px solid #e5e7eb;'>
                                <p style='color: #64748b; font-size: 14px;'>Silakan buka menu <strong>Email</strong> untuk approve/reject pengajuan ini.</p>
                            </div>
                        ",
                        'type' => 'approval_request',
                        'approval_request_id' => $approval->id,
                        'status' => 'pending'
                    ]);
                    
                    \Log::info('Email created: ID=' . $email->id);
                    
                } catch (\Exception $e) {
                    \Log::error('FAILED to create email!');
                    \Log::error('Error: ' . $e->getMessage());
                    
                    return redirect()->back()->with('error', 'Approval tersimpan, tapi email gagal: ' . $e->getMessage());
                }
                
                \Log::info('=== APPROVAL FLOW COMPLETED ===');
                
                return redirect()->back()->with([
                    'success' => '✉️ Pengajuan berhasil dikirim ke Admin via Email Internal. Menunggu approval.',
                    'is_approval' => true
                ]);
            }

            // KASIR - Jumlah < 10 juta, langsung simpan
            \Log::info('KASIR - Jumlah < 10 juta, saving directly...');

            TransaksiPengeluaran::create([
                'user_id' => auth()->id(),
                'jumlah' => $validated['jumlah'],
                'tanggal' => $validated['tanggal'],
                'keterangan' => $validated['keterangan'],
                'kategori_id' => $validated['kategori_id'],
            ]);

            \Log::info('=== DIRECT SAVE COMPLETED ===');

            return redirect()->back()->with('success', 'Pengeluaran berhasil disimpan');
            
        } catch (\Exception $e) {
            \Log::error('=== ERROR ===');
            \Log::error('Message: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }    
   
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'jumlah' => 'required|numeric|min:0',
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'kategori_id' => 'required|exists:kategori_pengeluaran,id',
        ]);

        $pengeluaran = TransaksiPengeluaran::findOrFail($id);
        $pengeluaran->update($validated);

        return redirect()->back()->with('success', 'Pengeluaran berhasil diperbarui');
    }
 
    public function destroy($id)
    {
        $pengeluaran = TransaksiPengeluaran::findOrFail($id);
        $pengeluaran->delete();

        return redirect()->back()->with('success', 'Pengeluaran berhasil dihapus');
    }
}