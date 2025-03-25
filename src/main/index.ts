import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { TabletServer } from './server'

// Instância global do servidor
const tabletServer = new TabletServer()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Configurar manipuladores de IPC para o servidor
  configureServerIPC()

  // Configurar IPC para comunicação com o DataService
  configureDataServiceIPC()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Garantir que o servidor seja encerrado ao sair do aplicativo
app.on('will-quit', async () => {
  if (tabletServer.isServerRunning()) {
    await tabletServer.stop()
  }
})

// Configurar manipuladores IPC para o servidor
function configureServerIPC(): void {
  // Iniciar servidor
  ipcMain.handle('server:start', async () => {
    try {
      const result = await tabletServer.start()
      return {
        success: true,
        port: result.port,
        ipAddress: result.ipAddress
      }
    } catch (error) {
      console.error('Erro ao iniciar servidor:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })

  // Parar servidor
  ipcMain.handle('server:stop', async () => {
    try {
      await tabletServer.stop()
      return { success: true }
    } catch (error) {
      console.error('Erro ao parar servidor:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })

  // Verificar status do servidor
  ipcMain.handle('server:status', () => {
    return {
      running: tabletServer.isServerRunning(),
      port: tabletServer.getPort(),
      ipAddress: tabletServer.getIpAddress()
    }
  })
}

// Configurar manipuladores IPC para o DataService
function configureDataServiceIPC(): void {
  // Receber dados transformados do DataService e armazená-los no servidor
  ipcMain.on('data-service:update-transformed-data', (_, data) => {
    // Atualizar os dados no servidor
    tabletServer.updateTransformedData(data)
  })
}
