import React from 'react';
//import React, { useState, useEffect } from 'react';

import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

const Login = () => {
   // const [isVisible, setIsVisible] = useState(false);

    const { data, setData, post, processing, errors } = useForm({

        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

     return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 overflow-hidden relative">
            {/* Background Spheres */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 right-10 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 30, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"
            />

            {/* Glass Login Form */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 p-10 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-lg shadow-2xl w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                        className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white">LOGIN</h2>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                        <motion.input
                            whileFocus={{ scale: 1.02 }}
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="email@example.com"
                        />
                        {errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                        <motion.input
                            whileFocus={{ scale: 1.02 }}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="••••••••"
                        />
                        {errors.password && <div className="text-red-400 text-sm mt-1">{errors.password}</div>}
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/80">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="form-checkbox h-4 w-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500 transition-all"
                            />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="hover:text-purple-300 transition-colors">Forgot password?</a>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                        {processing ? 'Signing In...' : 'SIGN IN'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;