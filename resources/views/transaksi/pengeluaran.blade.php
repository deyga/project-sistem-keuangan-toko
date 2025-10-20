<!DOCTYPE html>
<html>
<head>
    <title>Daftar Pengeluaran</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</head>
<body class="bg-light">

<div class="container mt-5">
    <h1 class="mb-4">📉 Daftar Transaksi Pengeluaran</h1>

    <table class="table table-striped table-bordered">
        <thead class="table-dark">
            <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Jumlah (Rp)</th>
                <th>Keterangan</th>
                <th>User</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($data as $item)
                <tr>
                    <td>{{ $item->tanggal }}</td>
                    <td>{{ $item->kategori->nama_kategori ?? '-' }}</td>
                    <td>{{ number_format($item->jumlah, 0, ',', '.') }}</td>
                    <td>{{ $item->keterangan }}</td>
                    <td>{{ $item->user->name ?? 'Tidak diketahui' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

</body>
</html>
