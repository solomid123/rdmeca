// Vite records the current source video sizes for each build. Cloudflare's
// ASSETS streaming responses may omit Content-Length, even on HEAD requests.
declare const __RDM_VIDEO_ASSET_SIZES__:Record<string,number>;

export async function serveVideoAsset(request:Request,assets:Fetcher):Promise<Response> {
  const response=await assets.fetch(request);
  if(response.status!==200)return response;
  const headers=new Headers(response.headers);
  headers.set('Accept-Ranges','bytes');
  const range=request.headers.get('range');
  const total=Number(headers.get('content-length'))||__RDM_VIDEO_ASSET_SIZES__[new URL(request.url).pathname];
  if(request.method!=='GET'||!range||!Number.isSafeInteger(total)||total<=0||!response.body)return new Response(response.body,{status:response.status,headers});

  const ifRange=request.headers.get('if-range');
  if(ifRange&&ifRange!==headers.get('etag')){
    const modified=Date.parse(headers.get('last-modified')||'');
    const requested=Date.parse(ifRange);
    if(!Number.isFinite(modified)||!Number.isFinite(requested)||requested<modified)return new Response(response.body,{status:200,headers});
  }
  // Multiple ranges may be ignored under HTTP semantics; browsers use one.
  const match=/^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if(!match||(!match[1]&&!match[2]))return new Response(response.body,{status:200,headers});
  const first=match[1]?Number(match[1]):Math.max(0,total-Number(match[2]));
  const last=match[1]&&match[2]?Math.min(total-1,Number(match[2])):total-1;
  if(!Number.isSafeInteger(first)||!Number.isSafeInteger(last)||first>=total||last<first||(!match[1]&&Number(match[2])===0)){
    await response.body.cancel();
    headers.set('Content-Range','bytes */'+total);
    headers.set('Content-Length','0');
    return new Response(null,{status:416,headers});
  }

  const reader=response.body.getReader();
  let skip=first,remaining=last-first+1;
  headers.set('Content-Range',`bytes ${first}-${last}/${total}`);
  headers.set('Content-Length',String(remaining));
  const body=new ReadableStream<Uint8Array>({
    async pull(controller){
      try{
        while(remaining>0){
          const {value,done}=await reader.read();
          if(done){controller.error(new Error('Video asset ended before the requested range.'));return;}
          if(skip>=value.length){skip-=value.length;continue;}
          const chunk=value.subarray(skip,skip+Math.min(remaining,value.length-skip));
          skip=0;remaining-=chunk.length;
          controller.enqueue(chunk);
          if(remaining===0){controller.close();await reader.cancel();}
          return;
        }
      }catch(error){controller.error(error);}
    },
    cancel(reason){return reader.cancel(reason);},
  });
  return new Response(body,{status:206,headers});
}
