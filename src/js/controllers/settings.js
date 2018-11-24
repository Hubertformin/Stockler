Stockler.controller('settingsCtr',($scope,$http)=>{
    const { ipcRenderer,app } = require('electron');
    const printers = JSON.parse(ipcRenderer.sendSync('synchronous-message'));
    const fs = require('fs');
    //console.log(printers);
    //context menu
    var list = document.getElementsByClassName;
    jQuery('.printers').on('contextmenu', (e) => {
        e.preventDefault()
        console.log('okay');
    }, false)
    //db transaction
    $scope.syncImport = {};
    $scope.db.transaction('rw',$scope.db.syncImport,()=>{
        $scope.db.syncImport.get(1,(data)=>{
            $scope.syncImport = data;
        });
    })
    .then(()=>{
        $scope.$apply();
    }).then(()=>{
        //settings array
    $scope.settings = {
        general:{
            mode:'admin'
        },
        sync:{
            url:'http://sync.web1337.net/users/emelie-telecom/',
            freq:1,
            import:{
                lastSync:$scope.frenchTimeAgo($scope.syncImport.date),
                range:$scope.syncImport.range
            }
        },
        printers:{
            active:false,
            default:printers.filter(el=>{
                return el.isDefault == true;
            }),
            All:printers
        }
    }
    $scope.defaultSettings = $scope.settings;
    //putting default printer in sessionStorage
    sessionStorage.setItem('printer',$scope.settings.printers.default[0].name);
    //console.log($scope.settings.printers.default);


    fs.readFile('bin/config.json',(err,fd)=>{
        if (err) {
            fs.exists('bin', (exists) => {
                if(exists){
                    fs.writeFile('bin/config.json',JSON.stringify($scope.defaultSettings),(err)=>{
                        if (err) {console.error(err);return;}
                    })
                }else{
                    fs.mkdir('bin', { recursive: true }, (err) => {
                        if (err) {console.error(err);return;}
                        fs.writeFile('bin/config.json',JSON.stringify($scope.defaultSettings),(err)=>{
                            if (err) {console.error(err);return;}
                        })
                    });
                }
              });
            return;
          }
          //parssong to settings
          $scope.settings = JSON.parse(fd);
          $scope.settings.sync.import.lastSync = $scope.frenchTimeAgo($scope.syncImport.date);
          $scope.settings.sync.import.range = $scope.syncImport.range;
    })
    })
    
    //settings.js
    $scope.toFrenchDateString = (date, t = false) => {
            var d = new Date(date),
            months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
            days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        if (t === true) {
            var hour = (d.getHours() < 10) ? `0${d.getHours()}` : d.getHours(),
                min = (d.getMinutes() < 10) ? `0${d.getMinutes()}` : d.getMinutes();
            return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()} - ${hour}:${min}`
        }
        return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
    }

    $scope.saveSettings = ()=>{
        //console.log($scope.settings);
        fs.exists('bin', (exists) => {
            if(exists){
                fs.writeFile('bin/config.json',JSON.stringify($scope.settings),(err)=>{
                    if (err) {console.error(err);return;}
                    //Notify settings
                    jQuery('#settings').fadeOut("fast");
                    notifications.info('Paramètres sauvegardés!')
                })
            }else{
                fs.mkdir('bin', { recursive: true }, (err) => {
                    if (err) {console.error(err);return;}
                    fs.writeFile('bin/config.json',JSON.stringify($scope.settings),(err)=>{
                        if (err) {console.error(err);return;}
                         //Notify settings
                        jQuery('#settings').fadeOut("fast");
                        notifications.info('Paramètres sauvegardés!')
                    })
                });
            }
          });
    }
    /*$scope.timeAgo = (time)=>{
        var now = Date.now(),ago = Number(time),
            diff = now - ago;
            if(diff < 0) return null;
        //
        //time ariables
        var seconds = Math.floor(diff/1000),
            minutes = Math.floor(diff/(1000* 60)),
            hours = Math.floor(diff/(1000 * 60 * 60)),
            days = Math.floor(diff/(1000 * 60 * 60 * 24)),
            weeks = Math.floor(diff/(1000 * 60 * 60 * 24 * 7)),
            months = Math.floor(diff/(1000 * 60 * 60 * 24 * 30)),
            years = Math.floor(diff/(1000 * 60 * 60 * 24 * 30 * 12));

        if(seconds <= 60){
            return "Just now";
        }else if(minutes <= 60){
            return (minutes == 1)?'A min ago':`${minutes} minutes ago`;
        }else if(hours < 24){
            return (hours == 1)?'An Hour ago':`${hours} hours ago`;
        }else if(days < 7){
            return (days == 1)?'Yesterday':`${days} days ago`;
        }else if(weeks < 4.3){
            return (weeks == 1)?'A week ago':`${weeks} weeks ago`;
        }else if(months < 12){
            return (months == 1)?'A month ago':`${months} months ago`;
        }else{
            return (years == 1)?'A Year ago':`${years} years ago`;
        }
    }*/
    $scope.frenchTimeAgo = (time)=>{
        var now = Date.now(),ago = Number(time),
            diff = now - ago;
            if(diff < 0) return null;
        //
        //time ariables
        var seconds = Math.floor(diff/1000),
            minutes = Math.floor(diff/(1000* 60)),
            hours = Math.floor(diff/(1000 * 60 * 60)),
            days = Math.floor(diff/(1000 * 60 * 60 * 24)),
            weeks = Math.floor(diff/(1000 * 60 * 60 * 24 * 7)),
            months = Math.floor(diff/(1000 * 60 * 60 * 24 * 30)),
            years = Math.floor(diff/(1000 * 60 * 60 * 24 * 30 * 12));

        if(seconds <= 60){
            return "Just now";
        }else if(minutes <= 60){
            return (minutes == 1)?'il y a une minute':`il y a ${minutes} minutes`;
        }else if(hours < 24){
            return (hours == 1)?'il y a une heure':`il y a ${hours} heures`;
        }else if(days < 7){
            return (days == 1)?'Heir':`il y a ${days} jours`;
        }else if(weeks < 4.3){
            return (weeks == 1)?'il y a un semaine':`il y a ${weeks} semaines`;
        }else if(months < 12){
            return (months == 1)?'il y a un mois':`il y a ${months} mois`;
        }else{
            return (years == 1)?'il y a une an':`il y a ${years} annees`;
        }
    }

    var date = new Date('2018-11-18 00:36');

    //console.log($scope.frenchTimeAgo(date.getTime()));

})

