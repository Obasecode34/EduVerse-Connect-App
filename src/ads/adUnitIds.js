import { TestIds } from 'react-native-google-mobile-ads';

// Google's TestIds always serve real (but non-monetized) test creatives —
// using them during development means you can build and click through every
// ad format without risking your AdMob account for invalid traffic, which
// Google can and does ban accounts for (clicking your own live ads repeatedly
// reads as fraud to their systems, even if it's honestly just you testing).
//
// __DEV__ is true for `expo start` / dev builds, false for anything built
// with `eas build --profile production`. That's the correct switch — it's
// NOT the same as checking NODE_ENV, which some RN setups get wrong.
//
// Fill in your real ad unit IDs (from the AdMob console, one per ad format
// per platform) in the REAL_IDS block below before shipping a production
// build. Every value in there is currently a placeholder.
const REAL_IDS = {
  banner: {
    android: 'ca-app-pub-8160598841675696/9220325913',
    ios: 'ca-app-pub-8160598841675696/6494924374',
  },
  interstitial: {
    android: 'ca-app-pub-8160598841675696/5723934030',
    ios: 'ca-app-pub-8160598841675696/4854539640',
  },
  rewarded: {
    android: 'ca-app-pub-8160598841675696/3507910794',
    ios: 'ca-app-pub-8160598841675696/4590640758',
  },
  appOpen: {
    android: 'ca-app-pub-8160598841675696/6207149765',
    ios: 'ca-app-pub-8160598841675696/7475824393',
  },
  native: {
    android: 'ca-app-pub-8160598841675696/9024884798',
    ios: 'ca-app-pub-8160598841675696/1101987737',
  },
};

const TEST_IDS = {
  banner: TestIds.ADAPTIVE_BANNER,
  interstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
  appOpen: TestIds.APP_OPEN,
  native: TestIds.NATIVE,
};

function platformKey() {
  // Deferring the Platform import to call time avoids a circular-import
  // headache some bundlers hit when this file is imported very early
  // (App.js, before react-native itself has fully initialized).
  return require('react-native').Platform.OS === 'ios' ? 'ios' : 'android';
}

export function getAdUnitId(format) {
  if (__DEV__) return TEST_IDS[format];
  return REAL_IDS[format][platformKey()];
}
