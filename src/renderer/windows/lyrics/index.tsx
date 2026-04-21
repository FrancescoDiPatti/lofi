/* eslint-disable no-console */
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { DEFAULT_SETTINGS } from '../../../models/settings';
import { Line, LyricsData } from '../../api/lyrics-api';
import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';
import { useSettings } from '../../contexts/settings.context';

const LyricsWrapper = styled.div`
  position: fixed;
  transition: background-color 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5em;
  max-width: 30ch;

  div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;

    .left {
      text-align: 'start';
    }

    .right {
      text-align: 'end';
    }
  }
`;

const FocusedText = styled.div`
  margin-top: 5px;
  margin-bottom: 5px;
`;

const FocusedTextWrapper = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

function breakTextIntoLines(text: string, maxLength: number): string[] {
  const isCJK = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
  const segments = isCJK ? Array.from(text) : text.split(' ');
  const lines: string[] = [''];
  let currentLine = 0;

  for (let i = 0; i < segments.length; i += 1) {
    if ((lines[currentLine] + segments[i]).length > (isCJK ? 0.5 * maxLength : maxLength)) {
      currentLine += 1;
      lines[currentLine] = '';
    }

    lines[currentLine] += isCJK ? segments[i] : `${segments[i]} `;
  }

  return lines;
}

interface LyricTextProps {
  lyrics?: LyricsData;
  loggedIn?: boolean;
  isTokenEmpty?: boolean;
  maxLength?: number;
  nextLyricsColor?: string;
  isLyricsBlur?: boolean;
}

function generateRandomLightColor(opacity: number): string {
  const h = Math.floor(Math.random() * 360);
  const s = 69;
  const l = 69;

  return `hsl(${h}, ${s}%, ${l}%, ${opacity / 255})`;
}

const LyricsText: FunctionComponent<LyricTextProps> = ({
  lyrics,
  loggedIn,
  isTokenEmpty,
  maxLength,
  nextLyricsColor,
  isLyricsBlur,
}) => {
  const { state } = useCurrentlyPlaying();
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const [lastManualScroll, setLastManualScroll] = useState<number>(0);
  const lines = lyrics?.lyrics?.lines || [];

  useEffect(() => {
    if (!lines.length) return;
    const onWheel = (e: WheelEvent) => {
      if (lines.length === 0) return;
      setManualIndex((prev) => {
        let idx = prev === null ? getSyncedIndex() : prev;
        idx += e.deltaY > 0 ? 1 : -1;
        idx = Math.max(0, Math.min(lines.length - 1, idx));
        return idx;
      });
      setLastManualScroll(Date.now());
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [lines]);

  useEffect(() => {
    if (manualIndex === null) return;
    const timeout = setTimeout(() => {
      setManualIndex(null);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [manualIndex, lastManualScroll]);

  function getSyncedIndex() {
    let idx = -1;
    lines.forEach((line: Line, i: number) => {
      if (Number(line.startTimeMs) < state.progress) {
        idx = i;
      }
    });
    return Math.max(0, idx);
  }

  if (!loggedIn) {
    return (
      <div>
        {isTokenEmpty && <FocusedText>Add sp_dc token</FocusedText>}
        {!isTokenEmpty && <FocusedText>Not a valid sp_dc token</FocusedText>}
      </div>
    );
  }
  if (!lines.length) {
    return (
      <div>
        <FocusedText>No Lyrics found</FocusedText>
      </div>
    );
  }

  const currentIndex = manualIndex !== null ? manualIndex : getSyncedIndex();
  const prevLyric = currentIndex > 0 ? lines[currentIndex - 1] : null;
  let lyric = lines[currentIndex];
  const nextLyric = currentIndex < lines.length - 1 ? lines[currentIndex + 1] : null;

  if (!lyric) {
    lyric = { startTimeMs: '0', endTimeMs: '0', words: '', syllables: [] };
  }

  const blurStyle = isLyricsBlur ? `blur(${0.55}px)` : 'none';

  return (
    <div>
      {prevLyric &&
        breakTextIntoLines(prevLyric.words, maxLength).map((line) => (
          <FocusedText style={{ filter: blurStyle }} key={line}>
            {line}
          </FocusedText>
        ))}
      <FocusedTextWrapper>
        {breakTextIntoLines(lyric.words, maxLength).map((line) => (
          <FocusedText key={line}>{line}</FocusedText>
        ))}
      </FocusedTextWrapper>
      {nextLyric &&
        breakTextIntoLines(nextLyric.words, maxLength).map((line) => (
          <FocusedText style={{ color: nextLyricsColor, filter: blurStyle }} key={line}>
            {line}
          </FocusedText>
        ))}
    </div>
  );
};

interface LyricsProps {
  lyrics?: LyricsData;
  loggedIn?: boolean;
  isOnLeft?: boolean;
}

export const Lyrics: FunctionComponent<LyricsProps> = ({ lyrics, loggedIn, isOnLeft }) => {
  const { state } = useSettings();
  const [randomBg, setRandomBg] = useState('');
  const [targetBg, setTargetBg] = useState('');

  useEffect(() => {
    if (state.isLyricsRandomBackground && DEFAULT_SETTINGS.isLyricsRandomBackground) {
      const interval = setInterval(() => {
        const normalizedOpacity = Math.floor((state.lyricsBackgroundOpacity / 100) * 255);
        setTargetBg(generateRandomLightColor(normalizedOpacity));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [state.isLyricsRandomBackground, state.lyricsBackgroundOpacity]);

  useEffect(() => {
    if (!targetBg) return;
    let animationFrame: number;
    let start: number | null = null;
    const duration = 1500;
    const from = randomBg || targetBg;
    const to = targetBg;

    function lerpColor(from: string, to: string, t: number) {
      const fromMatch = from.match(/hsl\((\d+), (\d+)%?, (\d+)%?, ([\d.]+)\)/);
      const toMatch = to.match(/hsl\((\d+), (\d+)%?, (\d+)%?, ([\d.]+)\)/);
      if (!fromMatch || !toMatch) return to;
      const [fh, fs, fl, fa] = fromMatch.slice(1).map(Number);
      const [th, ts, tl, ta] = toMatch.slice(1).map(Number);
      const lerp = (a: number, b: number) => a + (b - a) * t;
      return `hsl(${Math.round(lerp(fh, th))}, ${Math.round(lerp(fs, ts))}%, ${Math.round(lerp(fl, tl))}%, ${lerp(
        fa,
        ta
      )})`;
    }

    function animate(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      setRandomBg(lerpColor(from, to, t));
      if (t < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setRandomBg(to);
      }
    }
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetBg]);

  const backgroundColor = useMemo(() => {
    const normalizedOpacity = Math.floor((state.lyricsBackgroundOpacity / 100) * 255);
    const isLyricsRandomBackground = state.isLyricsRandomBackground && DEFAULT_SETTINGS.isLyricsRandomBackground;
    if (isLyricsRandomBackground) {
      return randomBg || generateRandomLightColor(normalizedOpacity);
    }
    const color = state.lyricsBackgroundColor || DEFAULT_SETTINGS.lyricsBackgroundColor;
    return `${color}${normalizedOpacity.toString(16)}`;
  }, [state, randomBg]);

  const maxLength = state.lyricMaxLength || DEFAULT_SETTINGS.lyricMaxLength;
  const nextLyricsColor = state.nextLyricsColor || DEFAULT_SETTINGS.nextLyricsColor;
  const isLyricsBlur = state.isLyricsBlur && DEFAULT_SETTINGS.isLyricsBlur;
  const lyricsCornerRadius = state.lyricsCornerRadius || DEFAULT_SETTINGS.lyricsCornerRadius;

  return (
    <LyricsWrapper
      style={{
        right: !isOnLeft && 0,
        left: isOnLeft && 0,
        fontFamily: state.lyricsFont || DEFAULT_SETTINGS.lyricsFont,
        fontSize: state.lyricsFontSize || DEFAULT_SETTINGS.lyricsFontSize,
        color: state.lyricsColor || DEFAULT_SETTINGS.lyricsColor,
        backgroundColor,
        maxWidth: `${maxLength}ch`,
        borderRadius: lyricsCornerRadius,
      }}>
      <LyricsText
        lyrics={lyrics}
        loggedIn={loggedIn}
        maxLength={maxLength}
        nextLyricsColor={nextLyricsColor}
        isLyricsBlur={isLyricsBlur}
      />
    </LyricsWrapper>
  );
};
