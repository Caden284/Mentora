import { Redirect } from 'expo-router';
// The root layout handles auth gating; default into the tabs.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
