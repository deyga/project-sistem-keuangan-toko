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
        // ========================================
        // TESTING DATABASE SEEDER
        // ========================================
        echo "🔄 Seeding Users...\n";

        $admin = User::create([
            'name' => 'admin test',  //nama users
            'email' => 'admin@test.com',  //email users
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'aktif',
        ]);

        $kasir = User::create([
            'name' => 'kasir Toko',  //users kasir
            'email' => 'kasir@test.com', //email kasir 
            'password' => bcrypt('password'),
            'role' => 'kasir',
            'status' => 'aktif',
        ]);

        echo "✅ Users created!\n";

        // ========================================
        // SEED KATEGORI PEMASUKAN
        // ========================================
        echo "🔄 Seeding Kategori Pemasukan...\n";

        KategoriPemasukan::insert([
            ['nama_kategori' => 'Penjualan Tunai', 'deskripsi' => 'Penjualan cash'],
            ['nama_kategori' => 'Penjualan Kredit', 'deskripsi' => 'Penjualan tempo'],
            ['nama_kategori' => 'Lain-lain', 'deskripsi' => 'Pemasukan lainnya'],
        ]);

        echo "✅ Kategori Pemasukan created!\n";

        // ========================================
        // SEED KATEGORI PENGELUARAN
        // ========================================
        echo "🔄 Seeding Kategori Pengeluaran...\n";

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

        echo " Kategori Pengeluaran created!\n";

        // ========================================
        // SEED TRANSAKSI PEMASUKAN
        // ========================================
        echo "🔄 Seeding Transaksi Pemasukan...\n";

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
                ...$data,
                'user_id' => $admin->id,
            ]);
        }

        echo "Transaksi Pemasukan created (7 transaksi)!\n";

        // ========================================
        // SEED TRANSAKSI PENGELUARAN
        // ========================================
        echo "🔄 Seeding Transaksi Pengeluaran...\n";

        $pengeluaranData = [
            ['tanggal' => Carbon::now()->subDays(5), 'kategori_id' => 1, 'jumlah' => 2500000, 'keterangan' => 'Beli stok dari supplier A'],
            ['tanggal' => Carbon::now()->subDays(3), 'kategori_id' => 3, 'jumlah' => 150000, 'keterangan' => 'Bayar listrik bulan ini'],
            ['tanggal' => Carbon::now()->subDays(2), 'kategori_id' => 2, 'jumlah' => 3000000, 'keterangan' => 'Gaji karyawan bulan Oktober'],
            ['tanggal' => Carbon::now()->subDays(1), 'kategori_id' => 4, 'jumlah' => 2000000, 'keterangan' => 'Bayar sewa toko'],
            ['tanggal' => Carbon::now(), 'kategori_id' => 5, 'jumlah' => 500000, 'keterangan' => 'Bensin dan transport'],
        ];

        foreach ($pengeluaranData as $data) {
            TransaksiPengeluaran::create([
                ...$data,
                'bukti_file' => null,
                'user_id' => $admin->id,
            ]);
        }

        echo " Transaksi Pengeluaran created (5 transaksi)!\n";
        echo "\n ALL SEEDING COMPLETED!\n";
        echo "================================================\n";
        echo "Login credentials:\n";
        echo "  Admin: username=admin / password=password\n";
        echo "  Kasir: username=kasir / password=password\n";
        echo "================================================\n";
    }
}
