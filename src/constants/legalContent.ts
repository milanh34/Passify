// src/constants/legalContent.ts

export const PRIVACY_POLICY = {
  lastUpdated: "2025-01-15",
  version: "1.0",
  content: `
# Privacy Policy

**Last Updated: January 15, 2025**

## Introduction

Passify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our mobile application.

## Summary

**We do not collect, store, or transmit any of your personal data to external servers.** Passify is designed as a completely offline, privacy-first password manager.

## Information We Do NOT Collect

- ❌ We do NOT collect personal information
- ❌ We do NOT collect usage analytics
- ❌ We do NOT use tracking cookies
- ❌ We do NOT share data with third parties
- ❌ We do NOT have access to your passwords
- ❌ We do NOT transmit any data over the internet

## How Your Data is Stored

### Local Storage Only
All your data is stored **exclusively on your device** using:
- **Encrypted Database**: Your accounts and passwords are encrypted using AES-256 encryption
- **Secure Enclave**: Your PIN and encryption keys are stored in your device's secure hardware (iOS Keychain / Android Keystore)

### Encryption Details
- **Algorithm**: AES-256-CTR with HMAC-SHA256 authentication
- **Key Derivation**: PBKDF2-style with 100,000 iterations
- **PIN Storage**: Hashed with 10,000 iterations, never stored in plaintext

## Backup Images

When you create a backup using the Encoder feature:
- The backup is encrypted with your chosen password
- The encrypted data is encoded into a PNG image
- This image is saved to your device or shared via your chosen method
- **We never see or have access to these backups**

## Biometric Data

If you enable biometric authentication:
- Biometric data (fingerprint, face) is handled entirely by your device's operating system
- We never access, store, or process your biometric data
- We only receive a success/failure response from the system

## Children's Privacy

Passify does not knowingly collect information from children under 13. The app is intended for general audiences who need to manage passwords.

## Data Deletion

Since all data is stored locally on your device:
- Uninstalling the app removes all data
- You can manually clear data through your device settings
- No data remains on any external servers (because none exists)

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date.

## Contact Us

If you have questions about this Privacy Policy, please contact us at:
- GitHub: https://github.com/milanh34

## Your Rights

Since we don't collect any data, traditional data rights (access, deletion, portability) are automatically fulfilled—you have complete control over your data on your device.
`,
};

export const TERMS_OF_SERVICE = {
  lastUpdated: "2025-01-15",
  version: "1.0",
  content: `
# Terms of Service

**Last Updated: January 15, 2025**

## Agreement to Terms

By downloading, installing, or using Passify ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.

## Description of Service

Passify is a local, offline password manager application that allows you to:
- Store and manage account credentials
- Encrypt your data using industry-standard encryption
- Create encrypted backup images
- Protect access with PIN and biometric authentication

## User Responsibilities

### You Are Responsible For:
1. **Remembering Your PIN/Password**: We cannot recover your data if you forget your PIN or backup password
2. **Creating Backups**: Regularly backing up your data using the Encoder feature
3. **Keeping Backups Secure**: Storing your backup images in a safe location
4. **Device Security**: Maintaining the security of your device

### You Agree NOT To:
- Reverse engineer, decompile, or disassemble the App
- Use the App for any illegal purposes
- Attempt to circumvent security features
- Distribute modified versions of the App

## Disclaimer of Warranties

THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
- MERCHANTABILITY
- FITNESS FOR A PARTICULAR PURPOSE
- NON-INFRINGEMENT

We do not warrant that:
- The App will be uninterrupted or error-free
- Defects will be corrected
- The App is free of viruses or harmful components

## Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
- Any indirect, incidental, special, consequential, or punitive damages
- Loss of data, profits, or business opportunities
- Any damages arising from your use or inability to use the App

**IMPORTANT**: Since all data is stored locally on your device and encrypted with your password, **we cannot recover lost data**. You acknowledge this risk and agree to maintain regular backups.

## Data Loss Acknowledgment

By using this App, you acknowledge and agree that:
1. You are solely responsible for maintaining backups of your data
2. If you forget your PIN and have no backup, your data is permanently lost
3. If you uninstall the App without backing up, your data is permanently lost
4. We have no ability to recover your passwords or data under any circumstances

## Security

While we implement strong encryption (AES-256), no security system is impenetrable. You acknowledge that:
- You use the App at your own risk
- You should use strong, unique PINs and backup passwords
- You should not share your PIN or backup passwords with others

## Intellectual Property

The App, including its code, design, and content, is protected by copyright and other intellectual property laws. You may not:
- Copy or modify the App
- Create derivative works
- Use our trademarks without permission

## Open Source Components

Passify may include open-source software components, each subject to their respective licenses. These licenses can be found in the App's source code repository.

## Updates and Modifications

We may:
- Update the App to fix bugs or add features
- Modify these Terms at any time
- Discontinue the App at any time

Continued use after changes constitutes acceptance of new Terms.

## Termination

You may stop using the App at any time by uninstalling it. We reserve the right to:
- Terminate or suspend access for Terms violations
- Discontinue the App without notice

## Governing Law

These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.

## Severability

If any provision of these Terms is found unenforceable, the remaining provisions will continue in effect.

## Entire Agreement

These Terms constitute the entire agreement between you and us regarding the App and supersede all prior agreements.

## Contact

For questions about these Terms, contact us at:
- GitHub: https://github.com/milanh34

## Acknowledgment

BY USING PASSIFY, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
`,
};

export const OPEN_SOURCE_LICENSES = {
  lastUpdated: "2025-01-15",
  content: `
# Open Source Licenses

Passify is built with the following open-source libraries:

## Core Framework
- **React Native** - MIT License
- **Expo** - MIT License
- **React** - MIT License

## UI & Animation
- **Moti** - MIT License
- **React Native Reanimated** - MIT License
- **Expo Linear Gradient** - MIT License

## Security
- **aes-js** - MIT License
- **expo-crypto** - MIT License
- **expo-secure-store** - MIT License
- **expo-local-authentication** - MIT License

## Storage
- **@react-native-async-storage/async-storage** - MIT License

## Navigation
- **expo-router** - MIT License
- **@react-navigation/native** - MIT License
- **@react-navigation/bottom-tabs** - MIT License

## Icons
- **@expo/vector-icons** - MIT License

## Fonts
- Google Fonts (various) - Open Font License

---

For full license texts, please visit the respective project repositories.
`,
};
