export function createVisualizer() {
  return WaveSurfer.create({
    container: "#waveform",
    waveColor: "#E5D0AC",
    progressColor: "#A31D1D",
    barWidth: 2,
    height: 90,
    responsive: true,
    normalize: true,
  });
}
