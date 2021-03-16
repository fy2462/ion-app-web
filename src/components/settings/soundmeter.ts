class SoundMeter {

  context: AudioContext
  public instant: number
  script: AudioWorkletNode
  mic: MediaStreamAudioSourceNode

  constructor(context: AudioContext) {
    this.context = context;
    this.instant = 0.0;
    //this.slow = 0.0;
    //this.clip = 0.0;
    this.script = new AudioWorkletNode(context, "icon-autdio");
    var that = this;
    
    this.script.addEventListener("icon-autdio", (event) => {
      var input = event.inputBuffer.getChannelData(0);
      var i;
      var sum = 0.0;
      var clipcount = 0;
      for (i = 0; i < input.length; ++i) {
        sum += input[i] * input[i];
        if (Math.abs(input[i]) > 0.99) {
          clipcount += 1;
        }
      }
      that.instant = Math.sqrt(sum / input.length);
      //that.slow = 0.95 * that.slow + 0.05 * that.instant;
      //that.clip = clipcount / input.length;
    });
  }

  connectToSource(stream) {
    this.mic = this.context.createMediaStreamSource(stream);
    this.mic.connect(this.script);
    // necessary to make sample run, but should not be.
    this.script.connect(this.context.destination);
  };

  stop() {
    this.mic.disconnect();
    this.script.disconnect();
  };
}

export default SoundMeter;
