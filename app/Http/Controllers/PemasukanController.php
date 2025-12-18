<?php

namespace App\Http\Controllers;

use App\Models\TransaksiPemasukan;
use App\Models\KategoriPemasukan;
use App\Http\Requests\StorePemasukanRequest; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PemasukanController extends Controller
{
    public function index()
    {
        return Inertia::render('Pemasukan/Index', [
            'transaksiList' => TransaksiPemasukan::with('kategori')
                ->latest('tanggal')
                ->get(),
            'kategoriList' => KategoriPemasukan::orderBy('nama_kategori')->get()
        ]);
    }

   
    public function store(StorePemasukanRequest $request) 
    {
        
        
    
        $validated = $request->validated(); 

        try {
            
            $transaksi = TransaksiPemasukan::create([
                'tanggal' => $validated['tanggal'],
                'kategori_id' => $validated['kategori_id'],
                'jumlah' => $validated['jumlah'],
                'keterangan' => $validated['keterangan'],
                'user_id' => Auth::id()
            ]);

            \Log::info('Store - Data tersimpan:', $transaksi->toArray());

           
            return redirect()->back()->with('success', 'Transaksi pemasukan berhasil ditambahkan!');
            
        } catch (\Exception $e) {
           
            \Log::error('Error creating transaksi pemasukan: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Gagal menambahkan transaksi. Silakan coba lagi!')
                ->withInput(); 
        }
    }

   
    public function update(StorePemasukanRequest $request, $id) 
    {
        try {
            // Cari transaksi
            $transaksi = TransaksiPemasukan::findOrFail($id);
            
            // Get validated data
            $validated = $request->validated(); 
            
            // Update transaksi
            $transaksi->update([
                'tanggal' => $validated['tanggal'],
                'kategori_id' => $validated['kategori_id'],
                'jumlah' => $validated['jumlah'],
                'keterangan' => $validated['keterangan']
            ]);

            \Log::info('Update - Data berhasil diupdate:', $transaksi->toArray());

            return redirect()->back()->with('success', 'Transaksi berhasil diupdate!');
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            
            \Log::error('Transaksi tidak ditemukan: ID ' . $id);
            return redirect()->back()->with('error', 'Transaksi tidak ditemukan!');
            
        } catch (\Exception $e) {
            \Log::error('❌ Error updating transaksi: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Gagal mengupdate transaksi!')
                ->withInput();
        }
    }

    
    public function destroy($id)
    {
        try {
            $transaksi = TransaksiPemasukan::findOrFail($id);
            
            // Simpan info transaksi 
            $transaksiInfo = $transaksi->toArray();
            
            $transaksi->delete();

            \Log::info('Delete - Data berhasil dihapus:', $transaksiInfo);

            return redirect()->back()->with('success', 'Transaksi berhasil dihapus!');
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Transaksi tidak ditemukan: ID ' . $id);
            return redirect()->back()->with('error', 'Transaksi tidak ditemukan!');
            
        } catch (\Exception $e) {
            \Log::error('Error deleting transaksi: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menghapus transaksi!');
        }
    }
}