<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\KategoriPemasukan;
use App\Models\KategoriPengeluaran;
use App\Models\TransaksiPemasukan;
use App\Models\TransaksiPengeluaran;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        echo "Seeding Users...\n";

    
        $admin = User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'admin',
                'password' => bcrypt('123'),
                'role' => 'admin',
                'status' => 'aktif',
            ]
        );

        $kasir = User::updateOrCreate(
            ['email' => 'kasir@test.com'],
            [
                'name' => 'kasir Toko',
                'password' => bcrypt('123'),
                'role' => 'kasir',
                'status' => 'aktif',
            ]
        );

        echo "Users created/updated!\n";

        
        // SEED KATEGORI PEMASUKAN
    
        echo "Seeding Kategori Pemasukan...\n";

        
        if (KategoriPemasukan::count() == 0) {
            KategoriPemasukan::insert([
                ['nama_kategori' => 'Penjualan Tunai', 'deskripsi' => 'Penjualan cash'],
                ['nama_kategori' => 'Penjualan Kredit', 'deskripsi' => 'Penjualan tempo'],
                ['nama_kategori' => 'Lain-lain', 'deskripsi' => 'Pemasukan lainnya'],
            ]);
            echo "Kategori Pemasukan created!\n";
        } else {
            echo "Kategori Pemasukan sudah ada, skip.\n";
        }

        
        // SEED KATEGORI PENGELUARAN
    
        echo "Seeding Kategori Pengeluaran...\n";

        
        if (KategoriPengeluaran::count() == 0) {
            KategoriPengeluaran::insert([
                ['nama_kategori' => 'Pembelian Stok', 'deskripsi' => 'Beli barang'],
                ['nama_kategori' => 'Gaji Karyawan', 'deskripsi' => 'Gaji bulanan'],
                ['nama_kategori' => 'Utilitas', 'deskripsi' => 'Listrik, air, internet'],
                ['nama_kategori' => 'Sewa Toko', 'deskripsi' => 'Sewa tempat'],
                ['nama_kategori' => 'Transportasi', 'deskripsi' => 'Transport & bensin'],
                ['nama_kategori' => 'Marketing/Promosi', 'deskripsi' => 'Iklan'],
                ['nama_kategori' => 'Perawatan/Maintenance', 'deskripsi' => 'Perbaikan'],
                ['nama_kategori' => 'Lain-lain', 'deskripsi' => 'Pengeluaran lainnya'],
            ]);
            echo "Kategori Pengeluaran created!\n";
        } else {
            echo "Kategori Pengeluaran sudah ada, skip.\n";
        }

        
        // SEED TRANSAKSI PEMASUKAN 
        
        echo "Seeding Transaksi Pemasukan...\n";

        if (TransaksiPemasukan::count() == 0) {
            $pemasukanData = [
                ['tanggal' => Carbon::now()->subDays(6), 'kategori_id' => 1, 'jumlah' => 5000000, 'keterangan' => 'Penjualan hari Senin'],
                ['tanggal' => Carbon::now()->subDays(5), 'kategori_id' => 1, 'jumlah' => 4500000, 'keterangan' => 'Penjualan hari Selasa'],
                ['tanggal' => Carbon::now()->subDays(4), 'kategori_id' => 1, 'jumlah' => 6000000, 'keterangan' => 'Penjualan hari Rabu'],
                ['tanggal' => Carbon::now()->subDays(3), 'kategori_id' => 1, 'jumlah' => 5500000, 'keterangan' => 'Penjualan hari Kamis'],
                ['tanggal' => Carbon::now()->subDays(2), 'kategori_id' => 1, 'jumlah' => 7000000, 'keterangan' => 'Penjualan hari Jumat'],
                ['tanggal' => Carbon::now()->subDays(1), 'kategori_id' => 1, 'jumlah' => 6500000, 'keterangan' => 'Penjualan hari Sabtu'],
                ['tanggal' => Carbon::now(), 'kategori_id' => 1, 'jumlah' => 5800000, 'keterangan' => 'Penjualan hari Minggu'],
            ];

            foreach ($pemasukanData as $data) {
                TransaksiPemasukan::create([
                    'user_id' => $admin->id,
                    'kategori_id' => $data['kategori_id'],
                    'jumlah' => $data['jumlah'],
                    'tanggal' => $data['tanggal'],
                    'keterangan' => $data['keterangan'],
                ]);
            }

            echo "Transaksi Pemasukan created (7 transaksi)!\n";
        } else {
            echo "Transaksi Pemasukan sudah ada, skip.\n";
        }

        
        // SEED TRANSAKSI PENGELUARAN 
        
        echo "Seeding Transaksi Pengeluaran...\n";

        if (TransaksiPengeluaran::count() == 0) {
            $pengeluaranData = [
                ['tanggal' => Carbon::now()->subDays(5), 'kategori_id' => 1, 'jumlah' => 2500000, 'keterangan' => 'Beli stok dari supplier A'],
                ['tanggal' => Carbon::now()->subDays(3), 'kategori_id' => 3, 'jumlah' => 150000, 'keterangan' => 'Bayar listrik bulan ini'],
                ['tanggal' => Carbon::now()->subDays(2), 'kategori_id' => 2, 'jumlah' => 3000000, 'keterangan' => 'Gaji karyawan bulan Oktober'],
                ['tanggal' => Carbon::now()->subDays(1), 'kategori_id' => 4, 'jumlah' => 2000000, 'keterangan' => 'Bayar sewa toko'],
                ['tanggal' => Carbon::now(), 'kategori_id' => 5, 'jumlah' => 500000, 'keterangan' => 'Bensin dan transport'],
            ];

            foreach ($pengeluaranData as $data) {
                TransaksiPengeluaran::create([
                    'user_id' => $admin->id,
                    'kategori_id' => $data['kategori_id'],
                    'jumlah' => $data['jumlah'],
                    'tanggal' => $data['tanggal'],
                    'keterangan' => $data['keterangan'],
                    'bukti_file' => null,
                ]);
            }

            echo "Transaksi Pengeluaran created (5 transaksi)!\n";
        } else {
            echo "Transaksi Pengeluaran sudah ada, skip.\n";
        }

        echo "\n ALL SEEDING COMPLETED!\n";
        echo "================================================\n";
        echo "Login credentials:\n";
        echo "  Admin: email=admin@test.com / password=123\n";
        echo "  Kasir: email=kasir@test.com / password=123\n";
        echo "================================================\n";
    }
}