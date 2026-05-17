A premium personal finance tracker app built with React + Expo, designed for the Nepali market.
Features

Dashboard with income, expense, saving overview and financial health gauge
Add / delete transactions across income, expense, loan, and saving categories
Portfolio donut chart and asset distribution table
Category breakdown and savings rate analysis
Collapsible sidebar + bottom navigation
Live stats — all charts update instantly as you add transactions


Getting Started
bashnpx create-expo-app FinanceNP
cd FinanceNP

# Replace App.js with FinanceApp.jsx content
npx expo start

Build APK
bashnpm install -g eas-cli
eas login
eas build:configure

# Test APK (sideload)
eas build -p android --profile preview

# Play Store release
eas build -p android --profile production
Tech Stack

React 18 + Expo
Custom SVG charts (no chart library)
DM Sans — Google Fonts
Inline CSS-in-JS styling


Roadmap

 Persistent storage (AsyncStorage / SQLite)
 Budget goals and alerts
 Dark mode
 CSV / PDF export
 Cloud sync (Firebase / Supabase)
 Full React Native conversion


License
MIT
