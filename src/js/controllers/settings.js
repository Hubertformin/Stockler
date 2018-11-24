Stockler.controller('settingsCtr',($scope,$http)=>{
    const { ipcRenderer,app } = require('electron');
    const printers = JSON.parse(ipcRenderer.sendSync('synchronous-message'));
    const fs = require('fs');
    //console.log(printers);
    fs.open('bin/config.json','a',(err,fd)=>{
        if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
          }
    })

    $scope.settings = {
        general:{
            mode:'admin'
        },
        sync:{
            url:'http://sync.web1337.net/users/emelie-telecom/',
            freq:1
        },
        printers:{
            active:false,
            default:printers.filter(el=>{
                return el.isDefault == true;
            }),
            All:printers
        }
    }
    //db transaction
    $scope.syncImport = {};
    $scope.db.transaction('rw',$scope.db.syncImport,()=>{
        $scope.db.syncImport.get(1,(data)=>{
            $scope.syncImport = data;
        });
    })
    .then(()=>{
        $scope.$apply();
        console.log(typeof $scope.syncImport)
    })


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

