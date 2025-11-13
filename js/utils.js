export async function fetchSongs(term) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term
  )}&entity=musicTrack&limit=10`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return data.results.map(track => ({
      title: track.trackName,
      artist: track.artistName,
      previewUrl: track.previewUrl,
      artwork: track.artworkUrl100
    }));
  } catch (err) {
    console.error("itunes error:", err);
    return [];
  }
}

export function fallbackSongs() {
  return [
    {
      title: "local demo 1",
      artist: "demo artist",
      previewUrl: "assets/songs/sample1.mp3",
    },
    {
      title: "local demo 2",
      artist: "demo artist",
      previewUrl: "assets/songs/sample2.mp3",
    },
  ];
}
