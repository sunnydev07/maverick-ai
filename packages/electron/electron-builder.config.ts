import type { ConfigFile } from 'electron-builder'

const config: ConfigFile = {
  productName: 'Maverick AI',
  appId: 'com.maverick.ai',
  directories: {
    output: 'dist',
    buildResources: 'resources'
  },
  files: [
    'dist/main.js',
    'dist/preload.js',
    'dist/renderer',
    'node_modules'
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    certificateFile: process.env.WIN_CERT_FILE || undefined,
    certificatePassword: process.env.WIN_CERT_PASSWORD || undefined,
    signingHashAlgorithms: ['sha256']
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Maverick AI',
    installerIcon: './resources/icon.ico',
    uninstallerIcon: './resources/icon.ico',
    installerHeaderIcon: './resources/icon.ico'
  },
  publish: {
    provider: 'github',
    owner: 'sunnydev07',
    repo: 'maverick-ai',
    releaseType: 'release'
  },
  afterSign: 'electron-builder-notarize.js'
}

export default config
