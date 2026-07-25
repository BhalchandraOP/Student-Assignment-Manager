import { BookOpenCheck } from 'lucide-react';
export default function Brand({compact=false}){return <div className={`brand ${compact?'brand--compact':''}`}><span className="brand__icon"><BookOpenCheck size={24}/></span><span>Student Assignment<br/> Tracker</span></div>}
