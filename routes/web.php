<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PemasukanController;
use App\Http\Controllers\PengeluaranController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
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
});

require __DIR__.'/auth.php';