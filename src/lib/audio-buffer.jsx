export function concatAudioBuffers(context, buffers) {
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const result = context.createBuffer(buffers[0].numberOfChannels, totalLength, buffers[0].sampleRate);

  let offset = 0;
  buffers.forEach(buffer => {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      result.getChannelData(channel).set(buffer.getChannelData(channel), offset);
    }
    offset += buffer.length;
  });

  return result;
}

export function sliceAudioBuffer(context, audioBuffer, start, end) {
  const length = end - start;
  const newBuffer = context.createBuffer(audioBuffer.numberOfChannels, length, audioBuffer.sampleRate);

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channelData = audioBuffer.getChannelData(i).slice(start, end);
    newBuffer.copyToChannel(channelData, i, 0);
  }

  return newBuffer;
}

