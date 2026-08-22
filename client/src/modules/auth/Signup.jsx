import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Signup(){
 const [form,setForm]=useState({employeeId:'',name:'',email:'',password:'',role:'employee'}); const navigate=useNavigate();
 async function submit(e){ e.preventDefault(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Invalid email format'); if(form.password.length<8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return toast.error('Password must be at least 8 characters and include a letter and a number'); try{ const {data}=await api.post('/auth/signup',form); toast.success(`Account created. Demo verification token: ${data.data.verificationToken}`); navigate('/login'); }catch{} }
 return <section><h1>Signup</h1><form onSubmit={submit} style={{display:'grid',gap:10,maxWidth:400}}>{[['employeeId','Employee ID'],['name','Name'],['email','Email'],['password','Password']].map(([k,p])=><input key={k} placeholder={p} type={k==='password'?'password':'text'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="employee">Employee</option><option value="admin">Admin</option></select><button>Create account</button></form><p>Already registered? <Link to="/login">Login</Link></p></section>;
}
