# 🔐 Passify

> **Version 1.0** - ***Your secure password manager***

#### A feature-rich password and account manager built with React Native and Expo. More updates coming soon! 🚀

## ✨ Features

- 📱 **Multi-Platform Management** - Organize accounts across different platforms
- 🎨 **Customizable Themes** - Multiple color schemes with system theme support
- 🔤 **Custom Fonts** - Select your preferred font family
- ⚡ **11 Animation Presets** - Personalize screen transitions
- 📋 **Expandable Cards** - View account details with smooth expand/collapse
- 👁️ **Password Visibility Toggle** - Securely hide/show passwords
- 📋 **Copy to Clipboard** - Quick copy for any field
- ⚙️ **Custom Schemas** - Define custom fields for each platform
- 🔄 **Data Transfer** - Move accounts between platforms
- 🔒 **Encode/Decode Tools** - Built-in data utilities

## 🛠️ Tech Stack

- React Native + Expo Router (v51+)
- TypeScript
- Moti (react-native-reanimated v3)
- AsyncStorage for data persistence
- Context API for state management
- Expo Vector Icons (Ionicons)

## 📁 Project Structure

```
app/
├── _layout.tsx                 # Root stack navigation
├── customize.tsx               # Theme & animation settings
└── (tabs)/
    ├── _layout.tsx             # Bottom tab navigation
    ├── index.tsx               # Manage platforms
    ├── transfer.tsx            # Data transfer
    ├── encoder.tsx             # Data encoder
    ├── decoder.tsx             # Data decoder
    └── accounts.tsx            # Account details

src/
├── context/
│   ├── ThemeContext.tsx        # Theme management
│   ├── DbContext.tsx           # Database & storage
│   └── AnimationContext.tsx    # Animation presets
└── components/
    ├── FAB.tsx                 # Floating action button
    ├── FormModal.tsx           # Add/edit modal
    ├── SchemaModal.tsx         # Field customization
    └── DeleteModal.tsx         # Delete confirmation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI

### Installation

```
# Clone the repository
git clone https://github.com/milanh34/Passify.git
cd passify

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Run on Device

```
# Android
npx expo run:android

# iOS
npx expo run:ios
```

## 🎨 Key Features Explained

### Animation System
- 11 preset animations (Slide, Fade, Scale, Bounce, etc.)
- Centralized animation management
- Persistent preferences
- Smooth transitions across all screens

### Account Cards
- Multiple cards can be expanded simultaneously
- Smooth animations with border highlights
- Password masking with toggle
- One-tap clipboard copy
- Custom fields per platform

### Customization
- System-aware theme switching
- Multiple color schemes
- Font family selection
- Animation style picker
- All preferences persist across sessions

## 📱 Screens

1. 📊 **Manage** - View all platforms and account counts
2. 🔑 **Accounts** - Detailed account view with expandable cards
3. 🔄 **Transfer** - Move accounts between platforms
4. 🔒 **Encoder** - Encode sensitive data
5. 🔓 **Decoder** - Decode encoded data
6. ⚙️ **Customize** - Personalize theme, font, and animations

## 🔒 Security Note

This is a local-only password manager. All data is stored on-device using AsyncStorage. For production use, consider implementing:
- Secure storage (Expo SecureStore)

## 🗺️ Roadmap

Version 1.0 is just the beginning! More features and improvements are coming soon.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ using React Native and Expo by Milan Haria**
