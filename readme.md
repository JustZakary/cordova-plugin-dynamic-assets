# Cordova Plugin Dynamic Assets

*A Cordova plugin to dynamically load and cache remote JavaScript and CSS assets specified in `config.xml` at runtime.*

## Installation

Install the plugin using the Cordova CLI:

```bash
cordova plugin add cordova-plugin-dynamic-assets
```

Alternatively, if you have the plugin code locally:

```bash
cordova plugin add path/to/cordova-plugin-dynamic-assets
```

## Usage

### Specify Remote Assets in `config.xml`

Add the `JS_URLS` and `CSS_URLS` preferences to your `config.xml` to specify the remote JavaScript and CSS files:

```xml
<preference name="JS_URLS" value="https://example.com/script1.js|https://example.com/script2.js" />
<preference name="CSS_URLS" value="https://example.com/style1.css|https://example.com/style2.css" />
```

- **Multiple URLs**: Separate multiple URLs with the `|` character.
- **Platform-Specific Assets**: You can specify different assets for different platforms using the `platform` element:

```xml
 <platform name="android">
    <preference name="JS_URLS" value="https://app.gutter-dog.com/android.js" />
  </platform>
  <platform name="ios">
    <preference name="JS_URLS" value="https://app.gutter-dog.com/ios.js" />
  </platform>
```


### Build and Run Your App

1. **Build the App**:

  ```bash
  cordova build
  ```

  - The plugin's `after_prepare` hook will fetch and store the specified assets during the build process.

2. **Run the App**:

  ```bash
  cordova run android
  # or
  cordova run ios
  ```

  - On app launch, the plugin will dynamically load and cache the assets, updating them if newer versions are available.

## License

This plugin is licensed under the MIT License.