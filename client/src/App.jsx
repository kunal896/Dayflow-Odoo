import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './modules/auth/Login';
import Signup from './modules/auth/Signup';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './modules/profile/Dashboard';
import ProfileView from './modules/profile/ProfileView';
import ProfileEdit from './modules/profile/ProfileEdit';
import AdminDashboard from './modules/profile/AdminDashboard';

function Placeholder({title}){ return <div><h1>{title}</h1><p>Module placeholder. Implement according to CONTRACT.md.</p></div>; }
export default function App(){ return <BrowserRouter><Routes>
 <Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/>
 <Route element={<ProtectedRoute/>}><Route element={<Layout/>}>
   <Route path="/" element={<Dashboard/>}/>
   <Route path="/profile" element={<ProfileView/>}/>
   <Route path="/profile/edit" element={<ProfileEdit/>}/>
   <Route path="/attendance" element={<Placeholder title="Attendance"/>}/>
   <Route path="/leave" element={<Placeholder title="Leave"/>}/>
   <Route path="/payroll" element={<Placeholder title="Payroll"/>}/>
 </Route></Route>
 <Route element={<ProtectedRoute role="admin"/>}><Route element={<Layout/>}>
   <Route path="/admin" element={<AdminDashboard/>}/>
   <Route path="/profile/:userId" element={<ProfileView/>}/>
   <Route path="/profile/:userId/edit" element={<ProfileEdit/>}/>
 </Route></Route>
 </Routes></BrowserRouter>; }
