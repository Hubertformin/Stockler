const {app, BrowserWindow,ipcMain,dialog} = require('electron')
  
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win


  function createWindow () {
    //FUL SCREEN WIDTH AND HEIGHT
      const {width,height} = require('electron').screen.getPrimaryDisplay().workAreaSize
    // Create the browser window.
    win = new BrowserWindow({
        width:width,
        height: height,
        title:'Stockler',
        icon: './logo.png',
        webPreferences: {
            nodeIntegrationInWorker: true
        }
    })
  
    // and load the index.html of the app.
    win.loadFile('src/index.html')
  
    // Open the DevTools.
    win.webContents.openDevTools()
  
    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  app.on('ready',()=>{
      // read the file and send data to the render process
      var fs = require('fs');
      ipcMain.on('get-file-data', function(event) {
          var data = null;
          try{
              if (process.platform == 'win32' && process.argv.length >= 2) {
                  var openFilePath = process.argv[1];
                  data = fs.readFileSync(openFilePath, 'utf-8');
              }
          }catch (e) {
              //
          }
          event.returnValue = data;
      });
      //
      win.onclose= (e) => {
          e.preventDefault();
      }
  })
  
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

    /*app.on('before-quit',(e)=>{
        e.preventDefault();
        dialog.showMessageBox({
            type:'question',
            message:'Etes vous sur de quiter?',
            buttons:['Annuler','Oui'],
            title:'Confirmer',
            defaultId:0,
            noLink:true,
            cancelId:0
        },(response)=>{
            console.log(response)
           if(response === 1){
               console.log(e);
               e.quit();
           }
        })
    })*/
  
  // In this file you can include the rest of your app's specific main process

