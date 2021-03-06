'use strict'

const {app, Tray, BrowserWindow, systemPreferences, ipcMain} = require('electron')
const path = require('path')
// db was here
const db = require('../shared/db.js')
const moment = require('moment')
const humanizeDuration = require('humanize-duration')
const _ = require('lodash')

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: function () { return 'y' },
      mo: function () { return 'mo' },
      w: function () { return 'w' },
      d: function () { return 'd' },
      h: function () { return 'h' },
      m: function () { return 'm' },
      s: function () { return 's' },
      ms: function () { return 'ms' }
    }
  }
})

var clock = null
// var contextMenu = {}
var menuItems = []
// var clockState
// app.dock.hide()

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let tray
let mainWindow

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createTray()
  checkClockStatus()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// My Stuff

const buildMenu = (isStart) => {
  console.log('Building menuter')
  menuItems.push({
    label: 'Start',
    type: 'normal',
    click: () => {
      tickClick()
    }
  })

  db.projects.find({}).exec((err, docs) => {
    if (err) {
      return console.log(err)
    }
    _.each(docs, doc => {
      menuItems.push({
        label: doc.name,
        type: 'radio',
        click: () => {
        }
      })
    })
    menuItems.push({
      label: 'Quit',
      type: 'normal',
      click: () => {
        app.quit()
      }
    })
    // console.log(Menu)
  })

  menuItems[0].label = (isStart) ? 'Stop' : 'Start'
}

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

const createTray = () => {
  const icon = (systemPreferences.isDarkMode()) ? 'lazer-dark.png' : 'lazer.png'

  tray = new Tray(path.join(__static, icon))

  tray.on('click', (event) => {
    if (mainWindow === null) {
      return createWindow()
    }
    toggleWindow()
  })
}

const tickClick = (project) => {
  console.log('tray click')

  db.sessions
    .find({})
    .sort({ start: -1 })
    .limit(1)
    .exec((err, lastDoc) => {
      if (err) {
        return console.log(err)
      }
      const isStart = (!lastDoc.length || lastDoc[0].end)

      buildMenu(isStart)

      var doc = {
        name: project.name
      }
      console.log('isStart', isStart)
      if (isStart) {
        doc.start = new Date()
      } else {
        return db.sessions.update({
          _id: lastDoc[0]._id
        },
          { $set: { end: new Date() }
          }, {}, (err, numberReplaced) => {
            console.log(err)
            console.log('numberReplaced', numberReplaced)
            stopClock()
          })
      }

      db.sessions.insert(doc, (err, newDoc) => {
        console.log('newDoc', newDoc)

        if (err) {
          return console.log(err)
        }

        if (newDoc.start) {
          return startClock(newDoc)
        }

        stopClock()
      })
    })
}

const startClock = (newDoc) => {
  console.log('starting clock ')
  mainWindow.webContents.send('clockRunning', newDoc.name)
  var id = +new Date()
  const clockCore = () => {
    console.log('t0ck', id)

    const startTime = moment(newDoc.start)
    const now = moment()

    const diff = now.diff(startTime, 'ms')
    console.log('diff', diff)
    const title = shortEnglishHumanizer(
      diff,
      {
        round: true,
        units: ['m']
      }
    )
    tray.setTitle(title)
    // ipcMain.send('tick', title)
  }

  clock = setInterval(clockCore, 60000)
  clockCore()
}

const stopClock = () => {
  mainWindow.webContents.send('clockRunning', false)
  clearInterval(clock)
  clock = null

  tray.setTitle('')
}

const checkClockStatus = () => {
  db.sessions
    .find({})
    .sort({start: -1})
    .limit(1)
    .exec((err, lastDoc) => {
      if (err) {
        return console.log(err)
      }

      if (!lastDoc.length || lastDoc[0].end) {
        return buildMenu()
      }

      buildMenu(true)

      // console.log(contextMenu.items)
      // console.log(lastDoc[0].label)
      // var activeMenu = _.find(contextMenu.items, { label: lastDoc[0].name })
      // console.log(activeMenu.checked = true)

      startClock(lastDoc[0])
    })
}
// console.log(ipcMain)
ipcMain.on('tock', (event, arg) => {
  // Print 1
  // console.log(event)
  console.log('tock', arg)
  tickClick(arg)
  // Reply on async message from renderer process
  // event.sender.send('async-reply', 2);
})
ipcMain.on('clockStatusAsk', (event, arg) => {
  console.log('clockStatusAsk')
  if (!arg) {
    return
  }
  checkClockStatus()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
