import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Login(){
 const [form,setForm]=useState({email:'',password:''}); const navigate=useNavigate();
 async function submit(e){ e.preventDefault(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Invalid email format'); try{ const {data}=await api.post('/auth/login',form); localStorage.setItem('dayflow_token',data.data.token); localStorage.setItem('dayflow_user',JSON.stringify(data.data.user)); toast.success('Login successful'); navigate('/'); }catch{} }
 return <section><h1>Login</h1><form onSubmit={submit} style={{display:'grid',gap:10,maxWidth:400}}><input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button>Login</button></form><p>No account? <Link to="/signup">Signup</Link></p></section>;
}
