const {app, Tray, net, Menu} = require('electron')
const path = require('path')
const fetch = require('electron-fetch')
const Datastore = require('nedb')
var db = {}
db.sessions = new Datastore({ filename: './db/sessions.db', autoload: true })
db.sessions.loadDatabase()

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  // startTick()
  // fetchPrice()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'lazer.png'))
  // tray.setTitle('--')

  // const contextMenu = Menu.buildFromTemplate([
  //   {label: 'Quit', type: 'normal', click: () => {
  //     app.quit()
  //   }}
  // ])

  // tray.setContextMenu(contextMenu)
  tray.on('click', (event) => {

    console.log('tray click')

    db.sessions.find({}).sort({time: -1}).limit(1).exec((err, lastDoc) => {

      console.log('lastDoc', lastDoc)

      const isStart = (!lastDoc.length || lastDoc[0].start === false) ? true : false
      const doc = {
        time: new Date(),
        start: isStart
      }

      db.sessions.insert(doc, (err, newDoc) => {
        console.log('newDoc', newDoc)
      })

    })
  })
}

const startTick = () => {
  
}