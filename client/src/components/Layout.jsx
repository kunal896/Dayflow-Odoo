import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
export default function Layout() { return <><Navbar/><main style={{padding:24,maxWidth:1000,margin:'0 auto'}}><Outlet/></main></>; }
