app.controller('reportsCtr',($scope)=>{
    //init
    var elems = document.querySelectorAll('.datepicker');

    
    //
    const {dialog} = require('electron').remote;
    //initializing dynamic variables
    $scope.salesItems = [];
    $scope.uniqueSalesItems = [];
    $scope.uniquesSalesDate = [];
    //
    function myDateString(d){
        var v = new Date(d);
        return v.toDateString();
    }
    //
    $scope.toFrenchDateString = (date)=>{
        var d = new Date(date),
            months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
            days =  ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
        return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
    }


    $scope.db.transaction('rw',$scope.db.sales,$scope.db.items,$scope.db.brand,()=>{
        $scope.db.brand.toArray()
            .then(data=>{
                $scope.brand = data;
            })
        $scope.db.items.toArray()
            .then(data=>{
                $scope.items = data;
            })
        $scope.db.sales.toArray()
            .then(data=>{
                $scope.sales = data;
            })
    })
        .then(()=>{
            //get uniqie date sal
            for(let i =0;i<$scope.sales.length;i++){
                $scope.salesItems = $scope.salesItems.concat($scope.sales[i].items);
                if(i>0 && myDateString($scope.sales[i-1].date) === myDateString($scope.sales[i].date)){
                    continue;
                }
                //$scope.sales[i].date = new Date($scope.sales[i].date)
                //$scope.sales[i].date = $scope.toFrenchDateString($scope.sales[i].date);
                $scope.uniquesSalesDate.push($scope.sales[i].date);
            }
        
        $scope.salesItems.sort(function (a, b) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });
        //date pickers
            const picMin = ($scope.uniquesSalesDate.length <= 31)? new Date($scope.uniquesSalesDate[0]):new Date($scope.uniquesSalesDate.length - 7);
            const picMax = new Date($scope.uniquesSalesDate[$scope.uniquesSalesDate.length - 1]);
            $scope.startDateInstance = M.Datepicker.init(jQuery('#from_date'),{
                format:'dddd dd mmmm yyyy',
                firstDay:1,
                minDate:picMin,
                maxDate:picMax,
                defaultDate:picMin,
                setDefaultDate:true,
                i18n:{
                    cancel:'Annuler',
                    months:['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'],
                    monthsShort:['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
                    weekdays:['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                    weekdaysShort:['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
                    weekdaysAbbrev: ['D','L','M','M','J','V','S']
                }
            });
            $scope.startDateInstance = M.Datepicker.init(jQuery('#to_date'),{
                format:'dddd dd mmmm yyyy',
                firstDay:1,
                minDate:picMin,
                maxDate:picMax,
                defaultDate:picMax,
                setDefaultDate:true,
                i18n:{
                    cancel:'Annuler',
                    months:['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'],
                    monthsShort:['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
                    weekdays:['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                    weekdaysShort:['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
                    weekdaysAbbrev: ['D','L','M','M','J','V','S']
                }
            });

        var ctx = document.getElementById('salesChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            // The data for our dataset
            data: {
                labels:['Aujhui','Heir','30/10/2018','29/10/2018','28/10/2018','27/10/2018','26/10/2018'],
                datasets: [{
                    label: "Ventes",
                    backgroundColor:'rgba(0, 150, 136,0.6)',
                    borderColor:'rgb(10, 150, 136)',
                    data:[40,35,23,41,25,20,30],
                }]
            },

            // Configuration options go here
            options: {}
        });
        $scope.$apply();
    }).catch(err=>{
        notifications.error('Erreur de base de donnees');
        console.error(err);
    });
    //================================== FUNCTION =====================
    function getRandomColor(num = 1,alpha = 0.7) {
        var letters = '0123456789ABCDEF',counter = 0,colors = [],
            color;
        do{
            color = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${alpha})`
            counter++;
            colors.push(color)
        }
        while(counter < num);
        return colors;
    }
    $scope.toBrandName = (id)=>{
        var name = 'Indisponible';
        for(let i = 0;i<$scope.brand.length;i++){
            if(Number($scope.brand[i].id) === Number(id)){
                name = $scope.brand[i].name;
                break;
            }
        }
        return name;
    }

    

    //1.Plotting the curve
    var ctx = document.getElementById("barChart").getContext('2d');
    var barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['iphone 6','galaxy s6','i20','galaxy s8'],
            datasets: [{
                label: 'Quantite vendu',
                data: [2,4,8,1],
                backgroundColor: getRandomColor(4),
                borderWidth: 0.5
            }]
        }
    });
    var ctx = document.getElementById("pieChart").getContext('2d');
    var pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['iphone 6','galaxy s6','i20','galaxy s8'],
            datasets: [{
                label: 'Quantite vendu',
                data: [2,4,8,1],
                backgroundColor: getRandomColor(4),
                borderWidth: 0.5
            }]
        },
        options: {
            angleLines:{
                display:true,
                color:'rgba(0, 0, 0, 0.6)'
            }
        }
    });

    $scope.saveLog = ()=>{
        $scope.saveData = {type:"reports",data:{brand:[],items:[],sales:[]}};
        $scope.db.transaction('rw',$scope.db.sales,$scope.db.items,$scope.db.brand,()=>{
            $scope.db.brand.toArray()
                .then(data=>{
                    $scope.saveData.data.brand = data;
                })
            $scope.db.items.toArray()
                .then(data=>{
                    $scope.saveData.data.items = data;
                })
            $scope.db.sales.toArray()
                .then(data=>{
                    $scope.saveData.data.sales = data;
                })
        }).then(()=>{
            var d = new Date();
            const path = `stockler_raports_${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}.stk`
            dialog.showSaveDialog({
                title:"Enregistrer",
                defaultPath:path,
                buttonLabel:"Enregistrer",
                filters: [
                    {name: 'Fichier STK', extensions: ['stk']},
                ]
            },(file)=>{
                if(typeof file !== 'string') return;
                //encryptng file
                const fileData = JSON.stringify($scope.saveData);

                const fileCryptr = new Cryptr('myTotalyFileSecretKey');
                const encryptedFileData = fileCryptr.encrypt(fileData);
                //const decryptedString = cryptr.decrypt(encryptedString);


                fs.writeFile(file,encryptedFileData,(err)=>{
                    if(err){
                        dialog.showErrorBox('Erreur',"Impossible de sauvegarder le fichier");
                        return;
                    }
                    notifications.info('Fichier sauvegarde');
                })
            })
        })


    }
    $scope.openLog = ()=>{
        dialog.showOpenDialog({
            title:"Ouvrir",
            buttonLabel:"Ouvrir",
            properties:['openFile'],
            filters: [
                {name: 'Fichier STK', extensions: ['stk']},
            ]
        },(file)=>{
            if(typeof file !== 'object') return;
            fs.readFile(file[0],(err,data)=>{
                if(err){
                    dialog.showErrorBox('Ce fichier est invalide');
                    return;
                }
                try{
                    const fileCryptr = new Cryptr('myTotalyFileSecretKey');
                    const logData = fileCryptr.decrypt(data);
                    console.log(JSON.parse(logData));
                }
                catch (e) {
                    dialog.showErrorBox('Erreur','Ce fichier est invalide');
                    console.error(e);
                }
            })
        })
    }
    //
    $scope.createReport = ()=>{
        var d = new Date();
        const path = `stockler_raports_${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}.pdf`
        dialog.showSaveDialog({
            title:"Enregistrer",
            defaultPath:path,
            buttonLabel:"Enregistrer",
            filters: [
                {name: 'PDF', extensions: ['pdf']},
            ]
        },(file)=> {
            if (typeof file !== 'string') return;
            const filedata =`<img src=".../logo.png" style="display:none;"><table style='margin-top:40px;border:1px solid #000;width:100%;'>${jQuery('#itemsLogs').html()}</table>`
            //write pdf
            var conversion = require("phantom-html-to-pdf")();
            conversion({
                html:filedata,
                header: `<h1 align="center" style="margin:20px;"><img src=".../logo.png"> Rapport du ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</h1>`,
                viewportSize: {
                    width: 600,
                    height: 600
                },
                format: {
                    quality: 100
                },
                fitToPage: true,
            }, function(err, pdf) {
                if(err){
                    dialog.showErrorBox('Erreur',"Ce fichier est ouvert d'ans un auttre application");
                    return;
                }
                var output = fs.createWriteStream(file)
                console.log(pdf.logs);
                console.log(pdf.numberOfPages);
                // since pdf.stream is a node.js stream you can use it
                // to save the pdf to a file (like in this example) or to
                // respond an http request.
                pdf.stream.pipe(output);
            });
        })
    }




});