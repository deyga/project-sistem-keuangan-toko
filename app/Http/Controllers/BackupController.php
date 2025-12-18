<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function index()
    {
       //cek auto rized 
       if (!Auth::user()->isAdmin()) {
            abort(403, 'akses ditolak.');
       }

        $backups = $this->getBackupFiles();
        
        return Inertia::render('Setting/Backup', [
            'backups' => $backups,
        ]);
    }
    
    public function create()
    {
        try {
            Artisan::call('backup:database');
            $output = Artisan::output();
            
            return back()->with('success', 'Backup berhasil dibuat!');
        } catch (\Exception $e) {
            return back()->with('error', 'Backup gagal: ' . $e->getMessage());
        }
    }
    
    public function download($filename)
    {
        $path = storage_path('app/backups/' . $filename);
        
        if (file_exists($path)) {
            return response()->download($path);
        }
        
        return back()->with('error', 'File tidak ditemukan!');
    }
    
    public function delete($filename)
    {
        $path = storage_path('app/backups/' . $filename);
        
        if (file_exists($path)) {
            unlink($path);
            return back()->with('success', 'Backup berhasil dihapus!');
        }
        
        return back()->with('error', 'File tidak ditemukan!');
    }
    
    private function getBackupFiles()
    {
        $path = storage_path('app/backups');
        
        if (!file_exists($path)) {
            return [];
        }
        
        $files = glob($path . '/backup-*.sql');
        $backups = [];
        
        foreach ($files as $file) {
            $backups[] = [
                'name' => basename($file),
                'size' => $this->formatBytes(filesize($file)),
                'date' => date('Y-m-d H:i:s', filemtime($file)),
            ];
        }
        
        // Sort by date descending
        usort($backups, function($a, $b) {
            return strcmp($b['date'], $a['date']);
        });
        
        return $backups;
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