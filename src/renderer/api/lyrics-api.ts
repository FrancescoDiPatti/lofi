/* eslint-disable no-console */

export interface Line {
  startTimeMs: string;
  words: string;
  syllables: any[];
  endTimeMs: string;
}
export interface LyricsData {
  lyrics: {
    syncType: string;
    lines: {
      startTimeMs: string;
      words: string;
      syllables: [];
      endTimeMs: string;
    }[];
    provider: string;
    providerLyricsId: string;
    providerDisplayName: string;
    syncLyricsUri: string;
    isDenseTypeface: boolean;
    alternatives: [];
    language: string;
    isRtlLanguage: boolean;
    fullscreenAction: string;
    showUpsell: boolean;
    capStatus: string;
    impressionsRemaining: number;
  };
  colors: {
    background: number;
    text: number;
    highlightText: number;
  };
  hasVocalRemoval: boolean;
}

class SpotifyLyricsAPI {
  constructor() {}

  async login(): Promise<boolean> {
    return true;
  }

  async getLyrics(trackTitle: string, artistName: string): Promise<LyricsData> {
    if (!trackTitle || !artistName) {
      return null;
    }
    try {
      const searchUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(
        trackTitle
      )}&artist_name=${encodeURIComponent(artistName)}`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) throw new Error('lrclib search failed');
      const searchResults = await searchRes.json();
      if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) return null;
      const lyricId = searchResults[0].id;
      const lyricsUrl = `https://lrclib.net/api/get/${lyricId}`;
      const lyricsRes = await fetch(lyricsUrl);
      if (!lyricsRes.ok) throw new Error('lrclib get failed');
      const lrclibData = await lyricsRes.json();
      const lines = (lrclibData.syncedLyrics || '')
        .split('\n')
        .map((line: string) => {
          const match = line.match(/^\[(\d+):(\d+).(\d+)\](.*)$/);
          if (!match) return null;
          const min = parseInt(match[1], 10);
          const sec = parseInt(match[2], 10);
          const ms = parseInt(match[3], 10) * 10;
          const startTimeMs = ((min * 60 + sec) * 1000 + ms).toString();
          return {
            startTimeMs,
            endTimeMs: startTimeMs,
            words: match[4].trim(),
            syllables: [] as any[],
          };
        })
        .filter(Boolean);
      return {
        lyrics: {
          syncType: 'LINE_SYNCED',
          lines,
          provider: 'lrclib',
          providerLyricsId: lyricId,
          providerDisplayName: 'lrclib',
          syncLyricsUri: lyricsUrl,
          isDenseTypeface: false,
          alternatives: [],
          language: lrclibData.language || 'en',
          isRtlLanguage: false,
          fullscreenAction: '',
          showUpsell: false,
          capStatus: '',
          impressionsRemaining: 0,
        },
        colors: {
          background: 0,
          text: 0,
          highlightText: 0,
        },
        hasVocalRemoval: false,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export const SpotifyLyricsApiInstance = new SpotifyLyricsAPI();
