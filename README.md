# vue-hackernews-2.0

HackerNews clone built with Vue 2.0 + vue-router + vuex, powered by Vite.

<p align="center">
  <a href="https://vue-hn.herokuapp.com" target="_blank">
    <img src="https://cloud.githubusercontent.com/assets/499550/17546273/5aabc5fc-5eaf-11e6-8d6a-ad00937e8bd6.png" width="700px">
    <br>
    Live Demo
  </a>
</p>

## Features

> Note: in practice, it is unnecessary to code-split for an app of this size (where each async chunk is only a few kilobytes), nor is it optimal to extract an extra CSS file (which is only 1kb) -- they are used simply because this is a demo app showcasing all the supported features.

- Client-side Rendering
  - Vue + vue-router + vuex working together
  - Route-level code splitting and async data pre-fetching
  - Vite-powered hot module replacement during development
- Progressive Web App
  - App manifest
- Single-file Vue Components
  - Stylus support
- Animation
  - Effects when switching route views
  - Real-time list updates with FLIP Animation

## A Note on Performance

This project started as a server-side rendering demo; many of the caveats still apply even though the app now runs purely on the client. There are a few things we probably won't do in production if we were optimizing for performance, for example:

- This demo uses the Firebase-based HN API to showcase real-time updates, but the Firebase API also comes with a larger bundle, more JavaScript to parse on the client, and doesn't offer an efficient way to batch-fetch pages of items, so it impacts performance quite a bit on a cold start or cache miss.

- In practice, it is unnecessary to code-split for an app of this size (where each async chunk is only a few kilobytes so the extra request isn't really worth it), nor is it optimal to extract an extra CSS file (which is only 1kb).

It is therefore not recommended to use this app as a reference for production performance - instead, do your own benchmarking, and make sure to measure and optimize based on your actual app constraints.

## Architecture Overview

The application now ships as a client-side SPA compiled with Vite. Routing and data fetching happen in the browser, while Firebase continues to provide the backend API.

## Build Setup

**Requires Node.js 14.18+**

``` bash
# install dependencies
npm install # or yarn

# start Vite dev server (http://localhost:5173 by default)
npm run dev

# build for production (outputs to dist/)
npm run build

# locally preview the production build
npm run preview
```

## License

MIT
