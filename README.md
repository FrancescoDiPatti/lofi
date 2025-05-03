<p align="center">
  <img height="64" src="https://raw.githubusercontent.com/dvx/lofi/master/icon.png">
</p>

<h1 align="center"><strong>Lofi: a tiny Spotify player</strong></h1>

<p align="center">
  <a target="_blank" href="https://www.lofi.rocks">Website</a> • <a target="_blank" href="https://www.lofi.rocks/help">FAQ</a> • <a target="_blank" href="https://discord.gg/YuH9UJk">Discord</a>
</p>

<table width="100%">
  <tr>
    <td width="50%"><img width="100%" src="https://www.lofi.rocks/min.jpg"></td>
    <td width="50%"><img width="100%" src="https://www.lofi.rocks/vis.gif"></td>
  </tr>
</table>

Lofi is a mini Spotify player with visualizations. It is _not_ a replacement for the Spotify Desktop app, nor does it play music independently of the Spotify app; instead, Lofi works alongside it to provide a more intuitive and pleasant access to common features. Lofi also displays cover art and track info stylishly and it facilitates WebGL-powered audio visualizations for both Windows, MacOS and Linux. In other words, it's a "tiny Spotify player" or a "mini mode" to enhance the Spotify desktop app.

## Design goals

- A small, `1:1` aspect ratio player depicting album art
- An always-on-top "widget-like" app
- Minimalist (no extraneous controls)
- Multiple-screen capable
- Windows, MacOS and Linux compatible
- Visualization-ready (WebGL)
- ≤ 100MB memory footprint

## Lyrics (new feature)

Lofi now uses [lrclib.net](https://lrclib.net) as the main source for lyrics. When a song is played, the app automatically searches for synchronized lyrics using the track title and artist name via the lrclib public API. Everything is fetched from the lrclib community-powered database.

- [lrclib API documentation](https://lrclib.net/docs)
- [lrclib GitHub repository](https://github.com/tranxuanthang/lrclib)

| Custom Font and background color | Minimalistic and simple|
|--|--|
|![](https://github.com/alient12/lofi/assets/73688480/2f0824c9-1a18-4730-9906-e9cf04030d14)|![](https://github.com/alient12/lofi/assets/73688480/0a95ac65-68b8-4a9d-84e5-ab3ad671024e)|

Installing `Circular Std Book` font is recommanded for lyrics.

# Building

To build, you'll need `node-gyp`, a compatible Python version (2.x), and your operating system's SDK (Microsoft Build Tools or Xcode).

First, you'll need to run:

```
$ yarn install
```

If you have more than one Python installation on your system, you can prevent the build from failing by editing the `package.json` file in the root directory.

Append the following on the `"build": ...` line:

```
--python path/to/python27
```

Now you can run `yarn install` again.

# Distribution

To **create a setup file**, run `yarn run dist`. The output will be located in `./dist`.

```
$ yarn run dist
```

# Development

To **develop**, open up a Terminal and type:

```
$ yarn run development
$ yarn run start
```

# Bugs, issues, and contributing

Found a 🐛? Have a feature request? Feel free to open an [issue](https://github.com/dvx/lofi/issues) or [contribute](https://github.com/dvx/lofi).

As always, you are more than welcome join our [Discord](https://discord.gg/YuH9UJk) 🎤 server. The more the merrier! 🎉

Don't forget to ⭐ and/or fork this repo.

# License

MIT
