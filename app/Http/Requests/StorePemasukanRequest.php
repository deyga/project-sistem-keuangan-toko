<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePemasukanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal' => [
                'required',
                'date',
                'before_or_equal:today',
                'after_or_equal:2020-01-01',
            ],
            'kategori_id' => [
                'required',
                'integer',
                'exists:kategori_pemasukan,id', 
            ],
            'jumlah' => [
                'required',
                'numeric',
                'min:1',
                'max:80000000',
            ],
            'keterangan' => [
                'nullable',
                'string',
                'max:100',
                'min:3',
            ],
        ];
    }

    public function messages(): array 
    {
        return [
            'tanggal.required' => 'Tanggal transaksi wajib diisi!',
            'tanggal.date' => 'Format tanggal tidak valid!',
            'tanggal.before_or_equal' => 'Tanggal tidak boleh melebihi hari ini!',
            'tanggal.after_or_equal' => 'Tanggal tidak boleh sebelum tahun 2020!',

            'kategori_id.required' => 'Kategori wajib dipilih!',
            'kategori_id.integer' => 'Kategori tidak valid!',
            'kategori_id.exists' => 'Kategori pemasukan tidak tersedia!',

            'jumlah.required' => 'Nominal wajib diisi!',
            'jumlah.numeric' => 'Nominal harus berupa angka!',
            'jumlah.min' => 'Nominal minimal Rp 1!',
            'jumlah.max' => 'Nominal terlalu besar!',

            'keterangan.string' => 'Keterangan harus berupa teks!',
            'keterangan.max' => 'Keterangan maksimal 100 karakter!',
            'keterangan.min' => 'Keterangan minimal 3 karakter!',
        ];
    }
}