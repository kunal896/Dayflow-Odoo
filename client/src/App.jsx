import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './modules/auth/Login';
import Signup from './modules/auth/Signup';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LeavePage from './modules/leave';
import PayrollPage from './modules/payroll';

function Placeholder({title}){ return <div><h1>{title}</h1><p>Module placeholder. Implement according to CONTRACT.md.</p></div>; }
export default function App(){ return <BrowserRouter><Routes>
 <Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/>
 <Route element={<ProtectedRoute/>}><Route element={<Layout/>}><Route path="/" element={<Placeholder title="Dashboard"/>}/><Route path="/profile" element={<Placeholder title="Profile"/>}/><Route path="/attendance" element={<Placeholder title="Attendance"/>}/><Route path="/leave" element={<LeavePage/>}/><Route path="/payroll" element={<PayrollPage/>}/></Route></Route>
 <Route element={<ProtectedRoute role="admin"/>}><Route element={<Layout/>}><Route path="/admin" element={<Placeholder title="Admin"/>}/></Route></Route>
 </Routes></BrowserRouter>; }
