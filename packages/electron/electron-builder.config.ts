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
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
}

export default config
