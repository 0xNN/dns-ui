# Puninar-UI: DataTable Package

Library komponen tabel tingkat lanjut yang dirancang khusus untuk ekosistem aplikasi Puninar. Komponen ini menyediakan fitur tabel yang kaya seperti *sticky columns*, pencarian, penyaringan (filtering), pengurutan (sorting), dan penomoran baris otomatis.

## Fitur Utama

- 🚀 **Performa Tinggi**: Menggunakan teknik optimasi React (useMemo, useCallback) untuk menangani data besar.
- 📌 **Sticky Columns**: Mendukung penguncian kolom di sisi kiri dan kanan (ideal untuk ID, Nama, atau Aksi).
- 🔍 **Filtering & Search**: Sistem penyaringan yang dapat dikonfigurasi (Search, Select, Multi-Select, Date Range, dll).
- 🔢 **Row Numbering**: Penomoran baris otomatis yang sinkron dengan paginasi.
- 📱 **Responsive**: Desain yang dioptimalkan untuk berbagai resolusi layar.
- 🎨 **Self-Contained**: Membawa komponen UI dasar sendiri untuk portabilitas maksimal.

## Prasyarat (Dependencies)

Sebelum menggunakan paket ini, pastikan proyek Anda telah menginstal dependensi berikut:

```bash
npm install lucide-react date-fns clsx tailwind-merge date-fns crypto-js
```

## Cara Instalasi di Proyek Lain

1.  Salin folder `package/` ini ke dalam folder komponen proyek Anda (misal: `src/components/puninar-ui`).
2.  **Penting!** Tambahkan path komponen ini ke dalam `tailwind.config.js` Anda agar gaya visualnya tidak terhapus:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/puninar-ui/**/*.{js,jsx,ts,tsx}", // Tambahkan baris ini
  ],
  // ...
}
```

## Penggunaan Dasar

### 1. Definisi Kolom

```tsx
import { DataTableColumn } from '@/components/puninar-ui';

const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    header: 'Nama',
    accessor: 'name',
    sticky: 'left', // Mengunci kolom di kiri
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
  },
  // ...
];
```

### 2. Implementasi di Komponen

```tsx
import { DataTable, DataTableProvider } from '@/components/puninar-ui';

function MyPage() {
  return (
    <DataTableProvider>
      <DataTable
        columns={columns}
        data={myData}
        isLoading={loading}
        rowKey="id"
        showRowNumber={true} // Tampilkan nomor urut
        showSelection={true}  // Tampilkan checkbox seleksi
        showExpand={true}     // Tampilkan baris expandable
        expandContent={(row) => <div>Detail: {row.description}</div>}
      />
    </DataTableProvider>
  );
}
```

## Dokumentasi Props Utama

| Prop | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `columns` | `DataTableColumn[]` | Konfigurasi kolom tabel. |
| `data` | `T[]` | Array data yang akan ditampilkan. |
| `isLoading` | `boolean` | Menampilkan skeleton loader saat true. |
| `rowKey` | `string` | Nama field unik sebagai ID baris (misal: 'id'). |
| `showRowNumber` | `boolean` | Menampilkan kolom nomor urut otomatis. |
| `stickyRowNumber` | `boolean` | Mengunci kolom nomor urut saat scroll horizontal. |
| `showSearch` | `boolean` | Menampilkan bar pencarian global. |
| `tableHeight` | `number \| string` | Menentukan tinggi tabel (aktifkan scroll internal). |

---

© 2026 DNS Zero.
