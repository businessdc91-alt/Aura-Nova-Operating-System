# AuraNova Android App

Native Android app built with Flutter + Kotlin for the AuraNova Studios creative platform.

## Architecture

```
Flutter (Dart) ─── MethodChannel ───→ Kotlin (Native)
     │                                      │
     ├── UI/Screens                        ├── Local AI (llama.cpp)
     ├── State Management                  ├── File Storage
     └── Firebase                          └── Model Management
```

## Features

- **Website Designer** - AI-powered design vibe session
- **Code Editor** - Smart coding with AI assistance
- **Art Studio** - Background removal, sprite generation
- **Social Feed** - Connect and share creations
- **AI Chat** - Local AI powered conversations
- **Settings** - Model management and configuration

## Local AI Models

The app supports running AI models locally on-device using llama.cpp:

| Model | Size | RAM | Description |
|-------|------|-----|-------------|
| **Gemma 3 2B Q4** ⭐ | 1.5 GB | 2 GB | Google's latest - recommended! |
| Gemma 2 2B Q4 | 1.4 GB | 2 GB | Efficient for everyday tasks |
| Phi-3 Mini 3.8B | 2.2 GB | 4 GB | Microsoft's powerful small model |
| Qwen2 1.5B Q4 | 0.9 GB | 1.5 GB | Ultra-lightweight |
| Mistral 7B Q4 | 4.1 GB | 6 GB | High-quality (needs powerful device) |
| Llama 3.2 1B Q4 ⭐ | 0.7 GB | 1 GB | Meta's compact mobile model |
| TinyLlama 1.1B | 0.6 GB | 1 GB | Fastest for older devices |

## Getting Started

### Prerequisites

1. **Flutter SDK** (3.2.0 or higher)
   ```bash
   # Windows
   choco install flutter
   
   # Or download from flutter.dev
   ```

2. **Android Studio** with Android SDK

3. **Kotlin** (bundled with Android Studio)

### Installation

1. Navigate to the android_app folder:
   ```bash
   cd android_app
   ```

2. Get Flutter dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

### Building APK

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# Split APKs by architecture (smaller size)
flutter build apk --split-per-abi
```

## Project Structure

```
android_app/
├── lib/
│   ├── main.dart                 # Entry point
│   ├── app.dart                  # Root widget
│   ├── core/
│   │   ├── theme/                # Colors, typography
│   │   ├── router/               # Navigation
│   │   └── services/             # AI service, storage
│   ├── features/
│   │   ├── home/                 # Home screen
│   │   ├── website_designer/     # Designer vibe session
│   │   ├── code_editor/          # Code editor
│   │   ├── art_studio/           # Art tools
│   │   ├── social/               # Social feed
│   │   ├── chat/                 # AI chat
│   │   └── settings/             # App settings
│   └── shared/
│       └── widgets/              # Reusable widgets
├── android/
│   └── app/src/main/kotlin/
│       └── com/auranovalabs/app/
│           ├── MainActivity.kt   # Flutter entry
│           └── channels/
│               └── AIChannel.kt  # Native AI bridge
└── pubspec.yaml                  # Dependencies
```

## Native AI Integration

The app uses llama.cpp for local AI inference:

1. **MethodChannel** - Flutter ↔ Kotlin communication
2. **EventChannel** - Streaming generation & download progress
3. **JNI** - Kotlin ↔ C++ (llama.cpp) bridge

Models are stored in: `app_data/files/models/`

## Development

### Adding a new screen

1. Create screen file in `lib/features/<feature>/`
2. Add route in `lib/core/router/app_router.dart`
3. Add navigation from home screen

### Adding a new AI model

1. Add entry to `MODEL_CATALOG` in `AIChannel.kt`
2. Include HuggingFace repo ID and filename
3. Model will appear in Settings for download

## License

Proprietary - AuraNova Labs
