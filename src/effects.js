// Sonidos originales sintetizados, sin archivos ni servicios externos.
export class ShowAudio {
  context=null;enabled=false;
  async unlock(){const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return false;this.context??=new C();await this.context.resume();return this.context.state==='running';}
  setEnabled(value){this.enabled=Boolean(value);if(!this.enabled&&this.context?.state==='running')this.context.suspend().catch(()=>{});if(this.enabled&&this.context?.state==='suspended')this.context.resume().catch(()=>{});}
  tone(freq=600,duration=.12,offset=0,type='sine',volume=.045){if(!this.enabled||this.context?.state!=='running')return;const t=this.context.currentTime+offset,osc=this.context.createOscillator(),gain=this.context.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain).connect(this.context.destination);osc.start(t);osc.stop(t+duration+.02);}
  chime(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,.6,i*.1));}
}
