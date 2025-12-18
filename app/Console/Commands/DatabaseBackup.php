<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    protected $signature = 'backup:database';
    protected $description = 'Backup database otomatis setiap hari';

    public function handle()
    {
        $filename = 'backup-' . Carbon::now()->format('Y-m-d_His') . '.sql';
        $path = storage_path('app/backups');
        
        // Buat folder jika belum ada
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        $fullPath = $path . '/' . $filename;
        
        // Ambil config database
        $dbName = env('database.connections.mysql.database');
        $dbUser = env('database.connections.mysql.username');
        $dbPass = env('database.connections.mysql.password');
        $dbHost = env('database.connections.mysql.host');
        
    
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump';
            
            if (empty($dbPass)) {
                $command = sprintf(
                    '"%s" -h %s -u %s %s > "%s" 2>&1',
                    $mysqldumpPath,
                    $dbHost,
                    $dbUser,
                    $dbName,
                    $fullPath
                );
            } else {
                $command = sprintf(
                    '"%s" -h %s -u %s --password="%s" %s > "%s" 2>&1',
                    $mysqldumpPath,
                    $dbHost,
                    $dbUser,
                    $dbPass,
                    $dbName,
                    $fullPath
                );
            }
        } else {
            // Linux/Mac
            if (empty($dbPass)) {
                $command = sprintf(
                    'mysqldump -h %s -u %s %s > %s 2>&1',
                    $dbHost,
                    $dbUser,
                    $dbName,
                    $fullPath
                );
            } else {
                $command = sprintf(
                    'mysqldump -h %s -u %s --password="%s" %s > %s 2>&1',
                    $dbHost,
                    $dbUser,
                    $dbPass,
                    $dbName,
                    $fullPath
                );
            }
        }
        
        // Jalankan command
        exec($command, $output, $result);
        
        // Cek hasil
        if (file_exists($fullPath) && filesize($fullPath) > 0) {
            $fileSize = $this->formatBytes(filesize($fullPath));
            $this->info('✅ Backup berhasil: ' . $filename);
            $this->info('📁 Lokasi: ' . $fullPath);
            $this->info('📊 Ukuran: ' . $fileSize);
            
            // Hapus backup yang lebih dari 30 hari
            $this->deleteOldBackups($path);
            
            return 0;
        } else {
            $this->error('❌ Backup gagal!');
            $this->error('Command: ' . $command);
            
            if (!empty($output)) {
                $this->error('Output:');
                foreach ($output as $line) {
                    $this->error($line);
                }
            }
            
            return 1;
        }
    }
    
    private function deleteOldBackups($path)
    {
        $files = glob($path . '/backup-*.sql');
        $now = time();
        
        foreach ($files as $file) {
            if (is_file($file)) {
                if ($now - filemtime($file) >= 30 * 24 * 60 * 60) {
                    unlink($file);
                    $this->info('🗑️ Hapus backup lama: ' . basename($file));
                }
            }
        }
    }
    
    private function formatBytes($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}