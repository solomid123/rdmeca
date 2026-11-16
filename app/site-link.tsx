'use client';
import {forwardRef,type ComponentPropsWithoutRef,type MouseEvent} from 'react';
import {useRouter} from 'next/navigation';

type Props=ComponentPropsWithoutRef<'a'>&{href:string;replace?:boolean;scroll?:boolean};

// Use the public router directly. Vinext's production Link dynamically imports
// a navigation namespace whose exports are lost when the browser chunks merge.
const SiteLink=forwardRef<HTMLAnchorElement,Props>(function SiteLink({href,onClick,replace=false,scroll=true,...props},ref){
  const router=useRouter();
  function navigate(event:MouseEvent<HTMLAnchorElement>){
    onClick?.(event);
    const anchor=event.currentTarget;
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
    const target=new URL(anchor.href,window.location.href);
    if(target.origin!==window.location.origin)return;
    event.preventDefault();
    const destination=target.pathname+target.search+target.hash;
    try{if(replace)router.replace(destination,{scroll});else router.push(destination,{scroll});}
    catch{if(replace)window.location.replace(target.href);else window.location.assign(target.href);}
  }
  return <a {...props} ref={ref} href={href} onClick={navigate}/>;
});
export default SiteLink;
