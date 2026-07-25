import {useState} from 'react';
import {Eye,EyeOff,LockKeyhole,Mail} from 'lucide-react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import Brand from '../components/Brand';
import {login} from '../services/authService';
import '../auth.css';
export default function LoginPage(){
 const navigate=useNavigate(),location=useLocation();
 const [email,setEmail]=useState('student@example.com'),[password,setPassword]=useState('Student@123'),[show,setShow]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(event){event.preventDefault();setError('');setBusy(true);try{await login({email,password});navigate(location.state?.from??'/dashboard',{replace:true})}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <main className="login-page"><Link className="login-brand" to="/"><Brand/></Link><section className="login-card"><div className="login-card__intro"><span><LockKeyhole size={25}/></span><h1>Welcome back</h1><p>Sign in to manage your assignments and deadlines.</p></div><form onSubmit={submit} noValidate><label htmlFor="email">Email address</label><div className="login-input"><Mail size={18}/><input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></div><label htmlFor="password">Password</label><div className="login-input"><LockKeyhole size={18}/><input id="password" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/><button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{error&&<p className="login-error" role="alert">{error}</p>}<button className="login-submit" type="submit" disabled={busy}>{busy?'Signing in…':'Sign In'}</button></form><div className="demo-credentials"><b>Demo student</b><span>student@example.com</span><span>Student@123</span></div><Link className="back-home" to="/">← Back to home</Link></section></main>
}
