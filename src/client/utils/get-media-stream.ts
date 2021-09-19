export async function getMediaStream(): Promise<MediaStream> {
  // Cope with browser differences.
  const audioContext = new AudioContext()

  // Create a filter node.
  const filterNode = audioContext.createBiquadFilter()
  // See https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#BiquadFilterNode-section
  filterNode.type = 'highpass'
  // Cutoff frequency. For highpass, audio is attenuated below this frequency.
  filterNode.frequency.value = 10000

  // Create a gain node to change audio volume.
  const gainNode = audioContext.createGain()
  // Default is 1 (no change). Less than 1 means audio is attenuated
  // and vice versa.
  gainNode.gain.value = 0.5

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 1920,
      height: 1080,
    },
  })
  // Create an AudioNode from the stream.
  const mediaStreamSource = audioContext.createMediaStreamSource(stream)
  mediaStreamSource.connect(filterNode)
  filterNode.connect(gainNode)
  // Connect the gain node to the destination. For example, play the sound.
  gainNode.connect(audioContext.destination)

  return stream
}
