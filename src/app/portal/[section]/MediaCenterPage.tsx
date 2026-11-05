"use client";
import {useEffect,useMemo,useState} from "react";
import type {FormEvent} from "react";
import Link from "next/link";

type Video={id:string;title:string;category:string;url:string;thumbnail?:string;duration?:string;description?:string};
const categories=["Trailer","Recruitment","Operations","Training","Events","Community"];
const labels:Record<string,string>={"media-all":"All Videos","media-categories":"Video Categories","media-playlists":"Playlists","media-upload":"Upload Video"};
export default function MediaCenterPage({mode,username}:{mode:"media-all"|"media-categories"|"media-playlists"|"media-upload";username:string}){
 const [videos,setVideos]=useState<Video[]>([]);
 const [category,setCategory]=useState("All");
 const [form,setForm]=useState({title:"",category:"Trailer",url:"",thumbnail:"",duration:""});
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 async function load(){try{const r=await fetch("/api/portal-data?kind=videos",{cache:"no-store"});const j=await r.json();if(r.ok&&Array.isArray(j))setVideos(j)}catch{}}
 useEffect(()=>{
   void load();
   const timer=window.setInterval(()=>{if(document.visibilityState==="visible")void load()},15000);
   const refresh=()=>{if(document.visibilityState==="visible")void load()};
   window.addEventListener("focus",refresh);
   document.addEventListener("visibilitychange",refresh);
   return()=>{window.clearInterval(timer);window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",refresh)};
 },[]);
 const filtered=useMemo(()=>videos.filter(v=>category==="All"||v.category===category),[videos,category]);
 async function publish(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");const item={...form,id:`video_${Date.now()}`};try{const r=await fetch("/api/portal-data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"videos",records:[item]})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Unable to publish video");setMessage("Video published successfully.");setForm({title:"",category:"Trailer",url:"",thumbnail:"",duration:""});await load()}catch(err:any){setMessage(err.message||"Unable to publish video.")}finally{setBusy(false)}}
 return <main className="mx-auto min-h-screen max-w-[1480px] px-5 py-9 sm:px-8">
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
   <div><Link href="/" className="quiet-link">← Command Center</Link><div className="hero-kicker mt-6">LSPD / MEDIA CENTER</div><h1 className="mt-2 text-4xl font-extrabold tracking-tight">{labels[mode]}</h1><p className="mt-2 text-sm text-slate-400">Official videos, department media, and operational documentation.</p></div>
   <div className="flex flex-wrap gap-2">{(["media-all","media-categories","media-playlists","media-upload"] as const).map(x=><Link key={x} href={`/portal/${x}`} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${mode===x?"border-amber-400 bg-amber-400/15 text-amber-300":"border-slate-700 text-slate-300 hover:border-amber-400"}`}>{labels[x]}</Link>)}</div>
  </div>
  {mode==="media-upload"?<section className="glass-card max-w-2xl rounded-2xl p-6"><div className="mb-5"><h2 className="section-title text-xl">Publish Department Video</h2><p className="mt-1 text-xs text-slate-400">Add a hosted video link to the LSPD media library. Raw MP4 upload requires configured storage.</p></div>
   <form onSubmit={publish} className="grid gap-4">
    <label className="field-label">Video Title<input className="portal-input mt-2 w-full" required maxLength={120} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="LSPD Recruitment Trailer"/></label>
    <label className="field-label">Category<select className="portal-input mt-2 w-full" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
    <label className="field-label">Video URL<input className="portal-input mt-2 w-full" required type="url" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://youtube.com/..."/></label>
    <label className="field-label">Thumbnail URL (optional)<input className="portal-input mt-2 w-full" type="url" value={form.thumbnail} onChange={e=>setForm({...form,thumbnail:e.target.value})} placeholder="https://..."/></label>
    <label className="field-label">Duration (optional)<input className="portal-input mt-2 w-full" maxLength={10} value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="03:25"/></label>
    <button disabled={busy} className="gold-button mt-2 disabled:opacity-50">{busy?"Publishing...":"Publish Video"}</button>
    {message&&<p className="text-sm text-slate-300" role="status">{message}</p>}
   </form></section>
  :mode==="media-categories"?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`glass-card rounded-xl p-6 text-left transition hover:-translate-y-1 ${category===c?"border-amber-400":""}`}><div className="text-xs uppercase tracking-widest text-amber-300">Video Category</div><h2 className="mt-2 text-2xl font-bold">{c}</h2><p className="mt-2 text-sm text-slate-400">{videos.filter(v=>v.category===c).length} videos</p></button>)}</div>
  :mode==="media-playlists"?<div className="grid gap-5 md:grid-cols-2">{categories.map(c=>{const items=videos.filter(v=>v.category===c);return <section className="glass-card rounded-xl p-5" key={c}><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{c} Playlist</h2><span className="text-xs text-slate-400">{items.length} videos</span></div><div className="mt-3 space-y-2">{items.length?items.map(v=><a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-700/70 p-3 text-sm hover:border-amber-400">{v.title}</a>):<p className="text-sm text-slate-500">No videos in this playlist yet.</p>}</div></section>})}</div>
  :<><div className="mb-5 flex flex-wrap gap-2"><button onClick={()=>setCategory("All")} className={`rounded-full border px-4 py-2 text-xs ${category==="All"?"border-amber-400 bg-amber-400/15 text-amber-300":"border-slate-700 text-slate-300"}`}>All Videos</button>{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`rounded-full border px-4 py-2 text-xs ${category===c?"border-amber-400 bg-amber-400/15 text-amber-300":"border-slate-700 text-slate-300"}`}>{c}</button>)}</div>
   {filtered.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map(v=><a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="glass-card overflow-hidden rounded-xl transition hover:-translate-y-1"><div className="aspect-video bg-slate-800 bg-cover bg-center" style={{backgroundImage:v.thumbnail?`url("${v.thumbnail}")`:undefined}}/><div className="p-4"><div className="text-[10px] uppercase tracking-widest text-amber-300">{v.category}</div><h3 className="mt-2 font-bold">{v.title}</h3><p className="mt-1 text-xs text-slate-400">{v.duration||"LSPD Media"}</p></div></a>)}</div>:<div className="glass-card rounded-xl p-10 text-center"><h2 className="text-xl font-bold">No Videos Yet</h2><p className="mt-2 text-sm text-slate-400">Department videos will appear here after they are published.</p><Link href="/portal/media-upload" className="gold-button mt-5 inline-flex">Upload Video</Link></div>}
  </>}
 </main>
}
