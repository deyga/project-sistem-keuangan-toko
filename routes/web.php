<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PemasukanController;
use App\Http\Controllers\PengeluaranController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\BackupController;
// use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\InternalEmailController;
use Inertia\Inertia;



Route::get('/', function () {
    return redirect()->route('dashboard');
});

//Route 
Route::middleware(['auth'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Transaksi Pemasukan
    Route::prefix('pemasukan')->name('pemasukan.')->group(function () {
        Route::get('/', [PemasukanController::class, 'index'])->name('index');
        Route::post('/', [PemasukanController::class, 'store'])->name('store');
        Route::put('/{id}', [PemasukanController::class, 'update'])->name('update');
        Route::delete('/{id}', [PemasukanController::class, 'destroy'])->name('destroy');
    });
    
    // Transaksi Pengeluaran
    Route::prefix('pengeluaran')->name('pengeluaran.')->group(function () {
        Route::get('/', [PengeluaranController::class, 'index'])->name('index');
        Route::post('/', [PengeluaranController::class, 'store'])->name('store');
        Route::put('/{id}', [PengeluaranController::class, 'update'])->name('update');
        Route::delete('/{id}', [PengeluaranController::class, 'destroy'])->name('destroy');
    });

    //raote Seting/backup
    // Route::get('/backup', [DashboardController::class, 'backup'])->name('backup');

    Route::middleware(['auth'])->group(function () {
    Route::get('/settings/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/settings/backup/create', [BackupController::class, 'create'])->name('backup.create');
    Route::get('/settings/backup/download/{filename}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/settings/backup/delete/{filename}', [BackupController::class, 'delete'])->name('backup.delete');
    });
    
    //log out raute
    Route::post('/logout', [DashboardController::class, 'logout'])->name('logout');

    //hanya admin yg bisa akses backup 
    Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::prefix('settings')->group(function () {
        Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
        
        });
    });

    // Kasir & admin bisa akses dashboard
    Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    });

    //route 403.jsx
    Route::get('/test-403', function () {
    return Inertia::render('Errors/403');
    });

   
    


     
    //fix debug
    Route::middleware('auth')->group(function () {
     Route::get('/api/emails/inbox', [InternalEmailController::class, 'inboxApi']);
     Route::get('/api/emails/sent', [InternalEmailController::class, 'sentApi']);
     Route::get('/api/emails/{id}', [InternalEmailController::class, 'showApi']);


   
    //API unread count
   Route::get('/api/emails/unread-count', [InternalEmailController::class, 'unreadCount']);

   

    Route::post('/api/emails/{id}/approve', [InternalEmailController::class, 'approve']);
    Route::post('/api/emails/{id}/reject', [InternalEmailController::class, 'reject']);
    Route::delete('/api/emails/{id}', [InternalEmailController::class, 'deleteEmail']); 
    

   });

     //crf token
    //  Route::get('/csrf-token', function () {
     // return response()->json(['csrf' => csrf_token()]);
     //  });


    
    
});

require __DIR__.'/auth.php';