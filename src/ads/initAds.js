import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import * as TrackingTransparency from 'expo-tracking-transparency';

// COMPLIANCE FLAG, not a style choice: tagForChildDirectedTreatment tells
// Google to serve only non-personalized, contextual ads and skips the ATT
// prompt entirely — required by COPPA (US) and Google Play's Families
// Policy for any app/section directed at children.
//
// This app's primary audience (job seekers, employers) is adults, so this
// defaults to false. BUT the Scholarships section of the job feed can
// plausibly attract secondary-school-age applicants. If you know or suspect
// a meaningful share of your users are under 13 (US) or under 16 (EU/UK,
// via tagForUnderAgeOfConsent), Google's own policy requires the child-
// directed tag regardless of what the "primary" audience looks like —
// this isn't optional once that's true, and getting it wrong risks the
// AdMob account itself, not just a support ticket.
const IS_CHILD_DIRECTED = false;
const IS_UNDER_AGE_OF_CONSENT = false;

// Add your device's ID here to see REAL ad unit IDs render as safe test
// creatives on this device only, instead of test IDs everywhere. This is
// how you verify your real ad unit IDs are wired correctly before a
// production build, without the invalid-traffic risk of clicking your own
// live ads. Find your device's ID in the Metro/adb logs after first launch —
// look for a line like "Use RequestConfiguration.Builder.setTestDeviceIds
// ... to get test ads on this device". It's harmless to leave your own
// device ID in here even after shipping; it only affects that one device.
const TEST_DEVICE_IDS = [];

let initializationPromise;

export async function initAds() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    // iOS 14.5+ requires this prompt before requesting a personalized/tracking
    // ad ID — skipped automatically on Android, where it's a no-op. Ads still
    // serve without consent here; they just fall back to non-personalized,
    // which is why this doesn't block ad loading below.
    try {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
      if (status === 'undetermined') {
        await TrackingTransparency.requestTrackingPermissionsAsync();
      }
    } catch (err) {
      // Simulators and some Android builds don't implement this API at all —
      // never let a missing permissions API block the rest of app startup.
    }

    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: IS_CHILD_DIRECTED,
      tagForUnderAgeOfConsent: IS_UNDER_AGE_OF_CONSENT,
      testDeviceIdentifiers: TEST_DEVICE_IDS,
    });

    await mobileAds().initialize();
  })();

  try {
    await initializationPromise;
  } catch (error) {
    // Permit a later retry after a transient SDK/network failure.
    initializationPromise = undefined;
    throw error;
  }
}
