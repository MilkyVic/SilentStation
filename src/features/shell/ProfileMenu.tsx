import {ui,useLocale} from '../preferences/ui';
import {useCallback,useEffect,useId,useRef,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChevronDown,LayoutDashboard,LogOut,Settings,ShieldCheck,User} from 'lucide-react';
import {AVATARS} from '../../../shared/accounts';
import type {AuthAccount} from '../../types/auth';

export default function ProfileMenu({account,onLogout,onOpen}:{account:AuthAccount;onLogout:()=>Promise<void>;onOpen?:()=>void}) {useLocale();
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false);
  const container=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null);
  const lastItem=useRef(false),loggingOut=useRef(false),mounted=useRef(true),menuId=useId(),location=useLocation();
  const name=account.profile.name.trim()||account.username;
  const key=account.profile.avatarKey;
  const avatar=key&&Object.hasOwn(AVATARS,key)?AVATARS[key as keyof typeof AVATARS]:AVATARS.mascot;
  const management=['Admin','Quản trị viên cấp cao'].includes(account.role);
  const dashboard=management||account.role==='Giáo viên';
  const close=useCallback((restoreFocus=false)=>{setOpen(false);if(restoreFocus)trigger.current?.focus();},[]);

  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  useEffect(()=>{close();},[account.id,location.pathname,close]);
  useEffect(()=>{
    if(!open)return;
    const items=menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)');
    (lastItem.current?items?.[items.length-1]:items?.[0])?.focus();
    const outside=(e:PointerEvent)=>{if(!container.current?.contains(e.target as Node))close();};
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close(true);}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open,close]);

  function show(last=false){lastItem.current=last;onOpen?.();setOpen(true);}
  function navigateMenu(e:React.KeyboardEvent<HTMLDivElement>){
    const items=[...menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)')??[]];
    if(e.key==='Tab'){close(true);return;}
    if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key)||!items.length)return;
    e.preventDefault();const index=items.indexOf(document.activeElement as HTMLElement);
    const next=e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;
    items[next].focus();
  }
  async function logout(){
    if(loggingOut.current)return;loggingOut.current=true;setBusy(true);
    try{await onLogout();close();}finally{loggingOut.current=false;if(mounted.current)setBusy(false);}
  }

  return <div className="profile-menu" ref={container}>
    <button ref={trigger} type="button" className="profile-trigger account-link" aria-label={`${ui('Mở menu tài khoản của')} ${name}`} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId}
      onClick={()=>open?close(true):show()} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();show(e.key==='ArrowUp');}}}>
      <img className="profile-avatar" src={avatar} alt="" aria-hidden="true" onError={e=>{if(e.currentTarget.getAttribute('src')!==AVATARS.mascot)e.currentTarget.src=AVATARS.mascot;}}/>
      <span className="profile-trigger-text"><span className="profile-greeting">{ui("Xin chào")}</span><strong className="profile-name">{name}</strong></span>
      <ChevronDown className="profile-chevron" size={16} aria-hidden="true"/>
    </button>
    {open&&<div ref={menu} id={menuId} className="profile-dropdown" role="menu" aria-label={ui("Menu tài khoản")} onKeyDown={navigateMenu}>
      <div className="profile-dropdown-header" role="presentation"><strong>{name}</strong><span>@{account.username} · {ui(account.role)}</span>{account.isQa&&<span className="qa-account-label">QA · {ui('Tài khoản kiểm thử')}<br/>{account.qaAccessExpiresAt&&new Date(account.qaAccessExpiresAt).toLocaleDateString()}</span>}</div>
      <Link role="menuitem" tabIndex={-1} to="/tai-khoan" onClick={()=>close(true)}><User size={17} aria-hidden="true"/>{ui("Tài khoản")}</Link>
      <Link role="menuitem" tabIndex={-1} to="/tai-khoan/settings" onClick={()=>close(true)}><Settings size={17} aria-hidden="true"/>{ui("Cài đặt")}</Link>
      {dashboard&&<Link role="menuitem" tabIndex={-1} to="/quan-tri" onClick={()=>close(true)}><LayoutDashboard size={17} aria-hidden="true"/>{management?ui("Tổng quan quản trị"):ui("Khu vực của tôi")}</Link>}
      {dashboard&&<Link role="menuitem" tabIndex={-1} to="/phat-khao-sat" onClick={()=>close(true)}><ShieldCheck size={17}/>{ui("Phát mã khảo sát")}</Link>}
      {management&&<Link role="menuitem" tabIndex={-1} to="/nghien-cuu" onClick={()=>close(true)}><ShieldCheck size={17} aria-hidden="true"/>{ui("Đợt khảo sát")}</Link>}
      <div className="profile-menu-divider" role="separator"/>
      <button type="button" role="menuitem" tabIndex={-1} className="profile-menu-logout" disabled={busy} onClick={()=>void logout()}><LogOut size={17} aria-hidden="true"/>{busy?ui("Đang đăng xuất…"):ui("Đăng xuất")}</button>
    </div>}
  </div>;
}
