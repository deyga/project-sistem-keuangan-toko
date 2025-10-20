<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $user = User::first();

        
        if (!$user) {
            $this->command->warn('Tidak ada user! Jalankan seeder user dulu.');
            return;
        }

        // Data Pemasukan (7 hari terakhir)
        $pemasukanData = [
            ['tanggal' => Carbon::now()->subDays(6), 'kategori_id' => 1, 'jumlah' => 5000000, 'keterangan' => 'Penjualan Senin'],
            ['tanggal' => Carbon::now()->subDays(5), 'kategori_id' => 1, 'jumlah' => 4500000, 'keterangan' => 'Penjualan Selasa'],
            ['tanggal' => Carbon::now()->subDays(4), 'kategori_id' => 1, 'jumlah' => 6000000, 'keterangan' => 'Penjualan Rabu'],
            ['tanggal' => Carbon::now()->subDays(3), 'kategori_id' => 1, 'jumlah' => 5500000, 'keterangan' => 'Penjualan Kamis'],
            ['tanggal' => Carbon::now()->subDays(2), 'kategori_id' => 1, 'jumlah' => 7000000, 'keterangan' => 'Penjualan Jumat'],
            ['tanggal' => Carbon::now()->subDays(1), 'kategori_id' => 1, 'jumlah' => 6500000, 'keterangan' => 'Penjualan Sabtu'],
            ['tanggal' => Carbon::now(), 'kategori_id' => 1, 'jumlah' => 5800000, 'keterangan' => 'Penjualan Minggu'],
        ];

        foreach ($pemasukanData as $data) {
            TransaksiPemasukan::create([
                'tanggal' => $data['tanggal'],
                'kategori_id' => $data['kategori_id'],
                'jumlah' => $data['jumlah'],
                'keterangan' => $data['keterangan'],
                'user_id' => $user->id,
            ]);
        }

        // Data Pengeluaran
        $pengeluaranData = [
            ['tanggal' => Carbon::now()->subDays(5), 'kategori_id' => 1, 'jumlah' => 2500000, 'keterangan' => 'Beli stok'],
            ['tanggal' => Carbon::now()->subDays(3), 'kategori_id' => 3, 'jumlah' => 150000, 'keterangan' => 'Bayar listrik'],
            ['tanggal' => Carbon::now()->subDays(2), 'kategori_id' => 2, 'jumlah' => 3000000, 'keterangan' => 'Gaji karyawan'],
            ['tanggal' => Carbon::now()->subDays(1), 'kategori_id' => 4, 'jumlah' => 2000000, 'keterangan' => 'Sewa toko'],
            ['tanggal' => Carbon::now(), 'kategori_id' => 5, 'jumlah' => 500000, 'keterangan' => 'Bensin'],
        ];

        foreach ($pengeluaranData as $data) {
            TransaksiPengeluaran::create([
                'tanggal' => $data['tanggal'],
                'kategori_id' => $data['kategori_id'],
                'jumlah' => $data['jumlah'],
                'keterangan' => $data['keterangan'],
                'bukti_file' => null,
                'user_id' => $user->id,
            ]);
        }

    }
}
