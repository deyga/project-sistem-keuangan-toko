import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}



//bacup.jsx

import React from 'react';
import { router } from '@inertiajs/react';
import { Download, Trash2, Database, Clock, HardDrive, Plus } from 'lucide-react';

const Backup = ({ backups }) => {
  
  const handleCreateBackup = () => {
    if (confirm('Buat backup database sekarang?')) {
      router.post('/settings/backup/create');
    }
  };
  
  const handleDownload = (filename) => {
    window.location.href = `/settings/backup/download/${filename}`;
  };
  
  const handleDelete = (filename) => {
    if (confirm(`Hapus backup ${filename}?`)) {
      router.delete(`/settings/backup/delete/${filename}`);
    }
  };
  
  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Database size={28} />
              Database Backup
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Backup otomatis setiap hari jam 23:59 WIB
            </p>
          </div>
          
          <button
            onClick={handleCreateBackup}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <Plus size={20} />
            <span className="font-medium">Backup Manual</span>
          </button>
        </div>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HardDrive className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Backup</p>
                <p className="text-xl font-bold text-slate-800">{backups.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">Backup Terakhir</p>
                <p className="text-sm font-semibold text-slate-800">
                  {backups.length > 0 ? backups[0].date : '-'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">Retensi</p>
                <p className="text-sm font-semibold text-slate-800">30 Hari</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabel Backup */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Nama File</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Ukuran</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {backups.length > 0 ? (
                backups.map((backup, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {backup.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {backup.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(backup.name)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(backup.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    Belum ada backup. Klik "Backup Manual" untuk membuat backup pertama.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Info Footer */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Catatan:</strong> Backup otomatis akan berjalan setiap hari jam 23:59 WIB. 
            Backup lama (lebih dari 30 hari) akan dihapus otomatis.
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default Backup;

