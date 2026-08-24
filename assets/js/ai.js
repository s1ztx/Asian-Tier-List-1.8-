/* ============================================================
   ASIAN AI — FRONTEND ABSTRACTION
   This is the ONLY place the frontend talks to an AI backend. It
   never holds a provider API key — that lives on the Worker (or
   isn't set yet, in which case the Worker honestly reports back
   that it isn't configured instead of faking a reply).

   Swapping providers/models later means editing the Worker's
   handleAiChat function only — this file and asianai.html don't
   need to change.
   ============================================================ */
window.ATL_AI = (function(){

  // Same Worker used for OAuth/KV/skins — one backend, one place to
  // configure. Change this if Asian AI ever needs its own Worker.
  const WORKER_URL = 'https://atl-oauth.rekhaahlawat25.workers.dev';

  /**
   * Sends a conversation to the AI backend. Each message is
   * { role, content, attachment? } where attachment (only ever on the
   * newest user message) is { mimeType, data (base64, no prefix), name }
   * for images/PDFs — Gemini reads these natively as vision/document
   * input, this isn't faked.
   * @param {Array<{role:'user'|'assistant', content:string, attachment?:object}>} messages
   * @param {string} [instructions] — optional custom system instructions
   * @returns {Promise<{ok:boolean, configured:boolean, reply?:string, error?:string}>}
   */
  async function sendMessage(messages, instructions){
    try{
      const resp = await fetch(`${WORKER_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, instructions: instructions || '' })
      });
      if(resp.status === 501){
        // Worker is reachable but no provider/key is configured yet —
        // this is the honest "not connected" case, not an error.
        return { ok:false, configured:false };
      }
      if(!resp.ok){
        return { ok:false, configured:true, error:'upstream_error' };
      }
      const data = await resp.json();
      return { ok:true, configured:true, reply: data.reply };
    }catch(e){
      return { ok:false, configured:true, error:'network_failed' };
    }
  }

  return { sendMessage };
})();
