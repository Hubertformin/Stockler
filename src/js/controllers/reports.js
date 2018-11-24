Stockler.controller('reportsCtr', ($scope,$filter,$routeParams) => {
    $scope.defaultTab = $routeParams.tab;
    jQuery('#reports').on('scroll', function () {
        //console.log(jQuery('#reports').scrollTop())
        if (jQuery('#reports').scrollTop() >= 168) {
            jQuery('#sectionTab').addClass('fixed');

        } else {
            jQuery('#sectionTab').removeClass('fixed');
        }
    });
    //init
    angular.element(document).ready(() => {
        jQuery('.modal').modal({
            dismissible:false
        });
        jQuery('.fixed-action-btn').floatingActionButton({
            direction: 'left',
            hoverEnabled: false
        });
        //Angular breaks if this is done earlier than document ready.
        try {
            var instance = M.Tabs.init(jQuery('.tabs'));
        } catch (e) {
            //console.log(e);
        }
        //body
        const {
            dialog
        } = require('electron').remote;
        const path = require('path');
        var elems = document.querySelectorAll('.datepicker');
        //dash.js
    
    
        //initializing dynamic variables
        $scope.salesItems = [];
        $scope.filteredStocks = [];
        $scope.uniqueSalesItems = [];
        $scope.uniqueSalesDate = [];
        $scope.barchartData = {}
        $scope.salesObject = {};
        $scope.itemRecords = [];
        //date
        $scope.startDateModel = null;
        $scope.endDateModel = null;
        //reportsSales
        $scope.newSales = [];
        //
        $scope.myDateString = (d, local = false) => {
            var v = new Date(d);
            if (local) {
                return v.toLocaleDateString();
            }
            return v.toDateString();
        }
        //
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
        //functions to be used in page
        $scope.toNumber = (n) => {
            return Number(n);
        }
        //
        $scope.reduceObjArray = (array, prop) => {
            array.unshift(0);
            const val = array.reduce((total, num) => {
                return total + num[prop];
            });
            array.splice(0, 1);
            return val;
        }
    
        var salesData ;
        $scope.db.transaction('rw', $scope.db.sales, $scope.db.items, $scope.db.brand,$scope.db.itemRecords, () => {
                $scope.db.brand.toArray()
                    .then(data => {
                        $scope.brand = data;
                    })
                $scope.db.items.toArray()
                    .then(data => {
                        $scope.items = data;
                    })
                $scope.db.itemRecords.toArray()
                .then(data=>{
                    $scope.itemRecords = data;
                })
                $scope.db.sales.toArray()
                    .then(data => {
                        salesData = data;
                        $scope.newSales = data;
                    })
            }).then(() => {
                //console.log(salesData[0].date);
                RenderView()
                .catch(err=>{
                    if(err === 'empty-db'){
                        return;
                    }
                    console.error(err);
                })
                $scope.$apply();
            })
            .catch(err => {
                notifications.error('Erreur de base de donnees');
                console.error(err);
            });
        /**
         * Deleting sales data 
         * @param {Sales.id} param passing sales id into function
         */
        $scope.deleteOrders = (i) => {
           if(confirm('Etes vous sur de suprimmer cette element?')){
                $scope.db.transaction('rw',$scope.db.sales,() => {
                $scope.db.sales.delete(i);
                //now fetchign
                $scope.db.sales.toArray()
                    .then(data => {
                        salesData = data;
                        $scope.newSales = data;
                    })
                }).then(()=>{
                    $scope.$apply()
                }).catch(err=>{
                    console.error(err);
                    notifications.error('Impposible de supprimmer!');
                })
           }
        }
        //================================== FUNCTION =====================
        $scope.triggerRender = ()=>{
            if(!$scope.startDateModel){
                notifications.info('Choisir une date de debut');
                return;
            }
            if(!$scope.startDateModel){
                notifications.info('Choisir une date de fine');
                return;
            }
            if($scope.startDateModel > $scope.endDateModel){
                notifications.warning('Le date de debut ne peut pas etre superieure a la date de fin!');
                return;
            }
            //hide the preview panel of the right side
            $scope.showPrevActive = false;
            //reportsSales
            //console.log($scope.startDateModel.getTime(),$scope.endDateModel.getTime())
    
            $scope.db.transaction('rw', $scope.db.sales,$scope.db.itemRecords, () => {
                $scope.db.sales.where('date').between($scope.startDateModel.getTime(),$scope.endDateModel.getTime(),true,true).toArray()
                    .then(data => {
                        $scope.newSales = data;
                    })
                $scope.db.itemRecords.where('date').between($scope.startDateModel.getTime(),$scope.endDateModel.getTime(),true,true).toArray()
                .then(data=>{
                    $scope.itemRecords = data;
                })
            }).then(() => {
                RenderView();
                $scope.$apply();
            }).catch(err=>{
                console.log(err);
            })
            //getting data
            //$scope.newSales = [];
            //$scope.newSales = $scope.filter;
            //console.log($scope.filter);
            //finally
            //RenderView();
            
        }
    
        function RenderView() {
            return new Promise((resolve, reject) => {
                //init...
                $scope.salesItems = [];
                $scope.filteredStocks = [];
                $scope.uniqueSalesItems = [];
                $scope.uniqueSalesDate = [];
                $scope.barchartData = {}
                //get uniqie date sal
                $scope.salesObject = {}
                //if empty database
                if($scope.newSales.length === 0){
                    reject('empty-db');
                }
    
                for (let i = 0; i < $scope.newSales.length; i++) {
                    $scope.salesItems = $scope.salesItems.concat($scope.newSales[i].items);
                    if (i > 0 && $scope.myDateString($scope.newSales[i - 1].date) === $scope.myDateString($scope.newSales[i].date)) {
                        //
                        $scope.salesObject[$scope.myDateString($scope.newSales[i-1].date, true)].push($scope.newSales[i]);
                        continue;
                    }
                    //$scope.newSales[i].date = new Date($scope.newSales[i].date)
                    //$scope.newSales[i].date = $scope.toFrenchDateString($scope.newSales[i].date);
                    $scope.salesObject[$scope.myDateString($scope.newSales[i].date, true)] = [$scope.newSales[i]];
                    $scope.uniqueSalesDate.push($scope.newSales[i].date);
                }
                //making the select in html autot select
                $scope.selectDateVal = ($scope.uniqueSalesDate.length <= 7) ? `${$scope.uniqueSalesDate[0]}` : `${$scope.uniqueSalesDate[$scope.uniqueSalesDate.length - 7]}`;
    
                $scope.salesItems.sort(function (a, b) {
                    return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
                });
                //console.log($scope.salesItems)
    
                for (let i = 0; i < $scope.salesItems.length; i++) {
                    if (i > 0 && $scope.salesItems[i - 1].id === $scope.salesItems[i].id ) {
                        $scope.salesItems[i - 1].count += 1;
                        $scope.salesItems[i - 1].count_qty += Number($scope.salesItems[i].order_qty);
                        $scope.salesItems[i - 1].totalAmount += Number($scope.salesItems[i].totalOrderPrice);
                        $scope.salesItems.splice(i, 1);
                        i--;
                        continue;
                    }
                    $scope.salesItems[i].count = 1;
                    $scope.salesItems[i].count_qty = $scope.salesItems[i].order_qty;
                    $scope.salesItems[i].totalAmount = $scope.salesItems[i].totalOrderPrice;
                }
                //Items records
                console.log($scope.itemRecords);
                $scope.stocksEntries = [];
                for(let n = 0; n < $scope.itemRecords.length;n++) {
                    if(n > 0 && $scope.itemRecords[n-1].model === $scope.itemRecords[n].model) {
                        //console.log($scope.itemRecords[n-1]);
                        $scope.stocksEntries[$scope.stocksEntries.length - 1].details.push({
                            qty:$scope.itemRecords[n].qty,
                            date:$scope.itemRecords[n].date,
                            staff:$scope.itemRecords[n].staff,
                        })
                        continue;
                    }
                    $scope.stocksEntries.push({
                        brand:$scope.itemRecords[n].brand,
                        model:$scope.itemRecords[n].model,
                        details:[{
                            qty:$scope.itemRecords[n].qty,
                            date:$scope.itemRecords[n].date,
                            staff:$scope.itemRecords[n].staff,
                        }]
                    })
                }
                console.log($scope.stocksEntries);
                //date pickers
                $scope.startDateModel = ($scope.uniqueSalesDate.length <= 31) ? new Date($scope.uniqueSalesDate[0]) : new Date($scope.uniqueSalesDate.length - 7);
                $scope.endDateModel = new Date($scope.uniqueSalesDate[$scope.uniqueSalesDate.length - 1]);
                $scope.endDateModel = new Date(`${$scope.endDateModel.toDateString()} 23:59`);
    
                $scope.startDateInstance = M.Datepicker.init(jQuery('.from_date'), {
                    format: 'dddd dd mmmm yyyy',
                    firstDay: 1,
                    minDate:new Date(salesData[0].date),
                    maxDate:new Date(salesData[salesData.length - 1].date),
                    defaultDate: $scope.startDateModel,
                    setDefaultDate: true,
                    i18n: {
                        cancel: 'Annuler',
                        months: ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'],
                        monthsShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
                        weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                        weekdaysAbbrev: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
                    },
                    onSelect: (dt) => {
                        //converting time to 23:59 to e the max time 
                        $scope.startDateModel = new Date(`${dt.toLocaleDateString()} 00:00`);
                        $scope.$apply();
                    }
                });
                $scope.endDateInstance = M.Datepicker.init(jQuery('.to_date'), {
                    format: 'dddd dd mmmm yyyy',
                    firstDay: 1,
                    minDate:new Date(salesData[0].date),
                    maxDate:new Date(salesData[salesData.length - 1].date),
                    defaultDate: $scope.endDateModel,
                    setDefaultDate: true,
                    i18n: {
                        cancel: 'Annuler',
                        months: ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'],
                        monthsShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
                        weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                        weekdaysAbbrev: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
                    },
                    onSelect: (dt) => {
                        //converting time to 23:59 to e the max time 
                        $scope.endDateModel = new Date(`${dt.toLocaleDateString()} 23:59`);
                        $scope.$apply();
                    }
                });
                //curves
                var ctx = document.getElementById('salesChart').getContext('2d');
                var chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'line',
                    // The data for our dataset
                    data: {
                        labels: $scope.uniqueSalesDate.map((el) => {
                            return $scope.toFrenchDateString(el)
                        }),
                        datasets: [{
                            label: "Ventes",
                            backgroundColor: 'rgba(0, 150, 136,0.6)',
                            borderColor: 'rgb(10, 150, 136)',
                            data: $scope.uniqueSalesDate.map((el, i) => {
                                return $scope.salesObject[$scope.myDateString(el, true)].length;
                            }),
                    }]
                    },
    
                    // Configuration options go here
                    options: {}
    
    
    
    
                });
                /*//bar data
                $scope.barchartData = {}
                $scope.barchartData.x = $scope.salesItems.map((el) => {
                    return el.model;
                })
                $scope.barchartData.y = $scope.salesItems.map((el) => {
                    return el.count;
                })
                //other charts
                var ctx = document.getElementById("barChart").getContext('2d');
                var barChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: $scope.barchartData.x,
                        datasets: [{
                            label: 'Quantite vendu',
                            data: $scope.barchartData.y,
                            backgroundColor: getRandomColor(4),
                            borderWidth: 0.5
                }]
                    }
                });
                //3.2 pie chart
                var ctx = document.getElementById("pieChart").getContext('2d');
                var pieChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: $scope.barchartData.x,
                        datasets: [{
                            label: 'Quantite vendu',
                            data: $scope.barchartData.y,
                            backgroundColor: getRandomColor(4),
                            borderWidth: 0.5
                }]
                    },
                    options: {
                        angleLines: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.6)'
                        }
                    }
                });*/
                //
                //money chart and few varibles settings
                var ctx = document.getElementById('salesMoneyChart').getContext('2d');
                var chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'line',
                    // The data for our dataset
                    data: {
                        labels: $scope.uniqueSalesDate.map((el) => {
                            return $scope.toFrenchDateString(el)
                        }),
                        datasets: [{
                            label: "Montant",
                            backgroundColor: 'rgba(0, 204, 0,0.6)',
                            borderColor: 'rgb(0, 204, 0)',
                            data: $scope.uniqueSalesDate.map((el, i) => {
                                return $scope.reduceObjArray($scope.salesObject[$scope.myDateString(el, true)], 'totalPrice');
                            }),
                }]
                    },
    
                    // Configuration options go here
                    options: {}
    
    
    
    
                });
               // console.log($scope.salesItems);
                $scope.amount_sold = $scope.reduceObjArray($scope.salesItems, 'totalAmount');
                $scope.qty_sold = $scope.reduceObjArray($scope.salesItems, 'count_qty');
                //funalling applying
                //$scope.$apply();
                resolve();
            })
        }
    
    
    
    
        function getRandomColor(num = 1, alpha = 0.7) {
            var letters = '0123456789ABCDEF',
                counter = 0,
                colors = [],
                color;
            do {
                color = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${alpha})`
                counter++;
                colors.push(color)
            }
            while (counter < num);
            return colors;
        }
        $scope.toBrandName = (id) => {
            var name = 'Indisponible';
            for (let i = 0; i < $scope.brand.length; i++) {
                if (Number($scope.brand[i].id) === Number(id)) {
                    name = $scope.brand[i].name;
                    break;
                }
            }
            return name;
        }
    
    
    
        //367.FAB actions
        $scope.saveLog = () => {
            if($scope.newSales.length === 0){
                return;
            }
            var minDate = new Date(salesData[0].date),
                maxDate = new Date(salesData[salesData.length - 1].date);
                $scope.export_filter = [];
                while(1 == 1){
                    $scope.export_filter.push(minDate.toLocaleDateString());
                    if(minDate.toDateString() === maxDate.toDateString()) break;
                    minDate = new Date(minDate.getTime() + 86400000)
                }
            var modal = M.Modal.getInstance(jQuery('#exportModal'));
            //console.log($scope.export_filter);
            modal.open();
            //select models
            $scope.export_start_select = ($scope.export_filter.length <= 7)? $scope.export_filter[0]:$scope.export_filter[$scope.export_filter.length - 7];
            $scope.export_end_select = $scope.export_filter[$scope.export_filter.length - 1];
            //password
            $scope.export_password = null;
            //export
            jQuery('#export_data_btn').on('click',()=>{
                if($scope.showPasswordInput && $scope.export_password === null){
                    notifications.warning('Un mot de passe valide est requise');
                    return;
                }
                //export var
                var minDate = Date.parse(`${$scope.export_start_select} 00:00`);
                var maxDate = Date.parse(`${$scope.export_end_select} 23:59`);
                //check
                if(minDate > maxDate){
                    notifications.warning('La date de debut est plus grande que la date de fin!');
                    return;
                }
                $scope.saveData = {
                    type: "reports",
                    exportDate:Date.now(),
                    minDate:minDate,
                    maxDate:maxDate,
                    user:$scope.currentUser.name,
                    password:$scope.export_password,
                    data: {
                        brand: [],
                        items: [],
                        sales: [],
                        users:[]
                    }
                }
                $scope.db.transaction('rw', $scope.db.sales, $scope.db.items, $scope.db.brand,$scope.db.users, () => {
                    $scope.db.brand.toArray()
                        .then(data => {
                            $scope.saveData.data.brand = data;
                        })
                    $scope.db.items.toArray()
                        .then(data => {
                            $scope.saveData.data.items = data;
                        })
                    $scope.db.sales.where('date').between(minDate,maxDate,true,true).toArray()
                        .then(data => {
                            $scope.saveData.data.sales = data;
                        })
                    $scope.db.users.toArray()
                        .then(data => {
                            $scope.saveData.data.users = data;
                        })
                }).then(() => {
                    var d = new Date();
                    const path = `STK_raports_du_${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}.stk`
                    dialog.showSaveDialog({
                        title: "Enregistrer",
                        defaultPath: path,
                        buttonLabel: "Enregistrer",
                        filters: [
                            {
                                name: 'Fichier STK',
                                extensions: ['stk']
                            },
                        ]
                    }, (file) => {
                        if (typeof file !== 'string') return;
                        //encryptng file
                        const fileData = JSON.stringify($scope.saveData);
                        console.log($scope.saveData);
        
                        const fileCryptr = new Cryptr('myTotalyFileSecretKey');
                        const encryptedFileData = fileCryptr.encrypt(fileData);
                        //const decryptedString = cryptr.decrypt(encryptedString);
        
                        fs.writeFile(file, encryptedFileData, (err) => {
                            if (err) {
                                dialog.showErrorBox('Erreur', "Impossible de sauvegarder le fichier");
                                return;
                            }
                            notifications.info('Données exportées!');
                            modal.close();
                        })
                    })
                })
            })
    
    
        }
        //open and parse
        $scope.openLog = () => {
            const path = require('path');
            dialog.showOpenDialog({
                title: "Ouvrir",
                buttonLabel: "Ouvrir",
                properties: ['openFile'],
                filters: [
                    {
                        name: 'Fichier STK',
                        extensions: ['stk']
                    },
                ]
            }, (file) => {
                if (typeof file !== 'object') return;
                //unssurpoted extension
                if(path.extname(file[0]) !== '.stk' && path.extname(file[0]) !== '.STK'){
                    notifications.error("Le type de fichier n'est pas supporté, veuillez importer un fichier stk!");
                    return;
                }
                //READING FILES
                fs.readFile(file[0], (err, data) => {
                    if (err) {
                        dialog.showErrorBox('Ce fichier est invalide');
                        return;
                    }
                    try {
                        const fileCryptr = new Cryptr('myTotalyFileSecretKey');
                        var logsData = fileCryptr.decrypt(data);
                        logsData = JSON.parse(logsData);
                        //console.log(logsData);
                        //parsingData
                        var modal = M.Modal.getInstance(jQuery('#importModal'));
                        $scope.previewImport = {
                            exportDate:$scope.toFrenchDateString(logsData.exportDate,true),
                            minDate:$scope.toFrenchDateString(logsData.minDate),
                            maxDate:$scope.toFrenchDateString(logsData.maxDate),
                            isPassword:(logsData.password === null)?false:true,
                            user:logsData.user
                        }
                        $scope.$apply();
                        modal.open();
                        //now implementing updates
                        jQuery('#import_data_btn').on('click',()=>{
                            if(typeof logsData.password === 'string' && 
                            $scope.importModalPassword !== logsData.password){
                                notifications.warning('Mot de passe Invalid');
                                return;
                            }
                            //now importing and display
                            //console.log(logsData.data);
                            $scope.db.transaction('rw',$scope.db.users,$scope.db.brand,$scope.db.items,$scope.db.sales,$scope.db.syncImport,()=>{
                                //$scope.db.users.clear()
                                $scope.db.users.bulkPut(logsData.data.users)
                                $scope.db.users.toArray()
                                .then((data)=>{
                                    $scope.users = data;
                                 });
                                //
                                $scope.db.brand.clear()
                                $scope.db.brand.bulkPut(logsData.data.brand)
                                $scope.db.brand.toArray()
                                    .then((data)=>{
                                        $scope.brand = data;
                                    })
                                $scope.db.items.clear()
                                $scope.db.items.bulkPut(logsData.data.items)
                                $scope.db.items.toArray()
                                .then((data)=>{
                                    $scope.items = data;
                                 });
                                //
                                $scope.db.sales.clear()
                                $scope.db.sales.bulkPut(logsData.data.sales)
                                $scope.db.sales.toArray()
                                .then((data)=>{
                                    salesData = data;
                                    $scope.sales = data;
                                 });
                                //
                                $scope.db.syncImport.put({
                                    id:1,
                                    date: Date.now(),
                                    exportDate:logsData.exportDate,
                                    range:[logsData.minDate,logsData.maxDate]
                                })
                            })
                            .then(()=>{
                                $scope.startDateModel = new Date(logsData.minDate);
                                $scope.endDateModel = new Date(logsData.maxDate);
                                $scope.triggerRender();
                                notifications.info('Donnees importees!');
                                modal.close();
                                $scope.$apply();
                            }).catch(err=>{
                                console.error(err);
                            })
                            
                        })
                        //
                    } catch (e) {
                        dialog.showErrorBox('Erreur', 'Ce fichier est invalide');
                        console.error(e);
                    }
                })
            })
        }
        //
        $scope.createReport = () => {
            if($scope.newSales.length === 0){
                return;
            }
            var modal = M.Modal.getInstance(jQuery('#createReportModal'));
            modal.open();
            jQuery('#create_report_btn').on('click',()=>{
                if(typeof $scope.reportTitle !== 'string' 
                || $scope.reportTitle == ''
                || typeof $scope.reportDetails !== 'string' || $scope.reportDetails == '')
                {
                    notifications.warning('Veuilliez completez tout les valuers');
                    return;
                }
                //get the 
                var d = new Date();
                const path = `EMILLE_TELECOM_RAPORTS_${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}.pdf`
                dialog.showSaveDialog({
                    title: "Enregistrer",
                    defaultPath: path,
                    buttonLabel: "Enregistrer",
                    filters: [
                        {
                            name: 'PDF',
                            extensions: ['pdf']
                        },
                    ]
                }, (file) => {
                    if (typeof file !== 'string') return;
                    var fs = require('fs');
                    var pdf = require('html-pdf');
                    //var html = fs.readFileSync('./src/templates/pdf.html', 'utf8');
    //=====================================================================================
        jQuery('#createReportModal').waitMe({
            effect : 'bounce',
            text : 'Création de pdf en cours',
            bg : 'rgba(255,255,255,0.7)',
            color : '#d32f2f',
            maxSize : '',
            waitTime : -1,
            textPos : 'vertical',
            fontSize : '',
            source : ''
            });
    
                const data = jQuery(`#${$scope.selectedReportTable}`).html(); 
                 var tfoot = ($scope.selectedReportTable === "itemsLogs")?`<th>Totals</th>
                                <th></th>
                                <th>${$filter('currency')($scope.qty_sold, "", 0)}</th>
                                <th></th>
                                <th>${$filter('currency')($scope.amount_sold, "FCFA ", 0)}</th>
                                <th></th>`:`<th>Totals</th>
                                <th></th>
                                <th></th>
                                <th>Qte: ${$filter('currency')($scope.qty_sold, "", 0)}</th>
                                <th>${$filter('currency')($scope.amount_sold, "FCFA ", 0)}</th>
                                <th></th><th></th>`;
                
                const html = `<html lang="en"><head><meta charset="UTF-8"><style>
                    * {margin: 0;padding: 0;box-sizing: border-box;}
                    body{text-align: center;font-family: sans-serif;}
                    header{background-color: #d32f2f;color: #fff;padding: 20px;}
                    header h1 img {width: 40px;height: auto;margin-right: 15px;transform: translateY(25%);}
                    section#body {padding: 10px;}h2.title{padding: 10px;text-align: left;color: #d32f2f;border-bottom: 1px solid #ddd;}
                    p.details {padding: 15px;}
                    table{border-width:1px;margin-top:40px; border-collapse: collapse;border-spacing: 0;width: 100%;border: 1px solid #ddd;}
                    tr{border-bottom: 1px solid #ddd;}th{font-weight:600}
                    th,td {text-align: left;padding:16px;}
                    table ul{list-style-type: circle;}.badge{font-weight:600;color:#f44336;}</style></head>
                    <body><header><h1>Emile Telecom
                    </h1></header>
                    <section id="body">
                        <h2 class="title">
                            ${$scope.reportTitle}
                        </h2>
                        <p class="details">
                            ${$scope.reportDetails}
                        </p>
                        <table>
                            ${data}
                            <tfoot>
                                ${tfoot}
                            </tfoot>
                        </table>
                    </section>
                </body>
                </html>`
    
    
                    
                    var options = { format: 'Letter' };
                    pdf.create(html, options).toFile(file, function(err, res) {
                        jQuery('#createReportModal').waitMe("hide");
                        if (err) {
                            notifications.error('Impossible de genere pdf (CHTMTOPDF)');
                            return;
                        }
                        $scope.reportTitle = '';
                        $scope.reportDetails = '';
                        modal.close();
                        notifications.success('PDF généré');
                             // { filename: '/app/businesscard.pdf' }
                        });           
                })
            })
            
        }
        //others
        $scope.previewSales = (e, i) => {
            $scope.sale = $scope.salesObject[$scope.myDateString(Number($scope.selectDateVal), true)][i];
            $scope.showPrevActive = true;
            jQuery('ul.collection li').removeClass('active');
            jQuery(e.currentTarget).addClass('active');
        }
        //export as exel
        $scope.saveExcel = () => {
            var modal = M.Modal.getInstance(jQuery('#tableExport'));
            modal.open();
            jQuery('#tableExportBtn').on('click',()=>{
                if($scope.selectedTableExport == '' || $scope.selectedTypeExport == ''){
                    notifications.warning('Choisir une tableaux et une methode!');
                    return;
                }
                //export
                var d = $scope.endDateModel;
                //var table = jQuery(`#${$scope.selectedTableExport}`);
                if($scope.selectedTableExport == 'itemsLogs'){
                    var file = 'Variation_de_stock';
                }
                else if($scope.selectedTableExport == 'salesTable'){
                    var file = 'Ventes_effectuer';
                }else if($scope.selectedTableExport == 'itemRecords') {
                    var file = "Entrées_de_produits";
                }
                file = `${file}_${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}`
                switch($scope.selectedTypeExport){
                    case 'excel':
                        if(typeof $scope.sheetName !== 'string' || $scope.sheetName == ''){
                            notifications.warning('Nom de la feuille est requise pour excel!');
                            break;
                        }
                        $scope.excel.createExcel({
                            id:$scope.selectedTableExport,
                            title:"Excel",
                            name:$scope.sheetName,
                            fileName:`${file}`
                        });
                        break;
                    case 'pdf':
                        const path = `${file}.pdf`
                        dialog.showSaveDialog({
                            title: "Enregistrer",
                            defaultPath: path,
                            buttonLabel: "Enregistrer",
                            filters: [
                                {
                                    name: 'PDF',
                                    extensions: ['pdf']
                                },
                            ]
                            }, (file) => {
                                if (typeof file !== 'string') return;
                                //loader
                                jQuery('#tableExport').waitMe({
                                    effect : 'bounce',
                                    text : 'Création de pdf en cours',
                                    bg : 'rgba(255,255,255,0.7)',
                                    color : '#388e3c',
                                    maxSize : '',
                                    waitTime : -1,
                                    textPos : 'vertical',
                                    fontSize : '',
                                    source : ''
                                    });
                            var fs = require('fs');
                            var pdf = require('html-pdf');
                            var data = jQuery(`#${$scope.selectedTableExport}`).html();
                            var tfoot = "";
                            if($scope.selectedTableExport === "itemsLogs"){
                                tfoot = `<th>Totals</th>
                                <th></th>
                                <th>${$filter('currency')($scope.qty_sold, "", 0)}</th>
                                <th></th>
                                <th>${$filter('currency')($scope.amount_sold, "FCFA ", 0)}</th>
                                <th></th>`;
                            } else if($scope.selectedTableExport === "salesTable") {
                                tfoot = `<th>Totals</th>
                                <th></th>
                                <th></th>
                                <th>Qte: ${$filter('currency')($scope.qty_sold, "", 0)}</th>
                                <th>${$filter('currency')($scope.amount_sold, "FCFA ", 0)}</th>
                                <th></th><th></th>`;
                            }
                        const html = `<html lang="en"><head><meta charset="UTF-8"><style>
                        * {margin: 0;padding: 0;box-sizing: border-box;}
                        body{text-align: center;font-family: sans-serif;}
                        header{background-color: #1b5e20;color: #fff;padding: 20px;}
                        header h1 img {width: 40px;height: auto;margin-right: 15px;transform: translateY(25%);}
                        section#body {padding: 10px;}h2.title{padding: 10px;text-align: left;color: #d32f2f;border-bottom: 1px solid #ddd;}
                        p.details {padding: 15px;}
                        table{border-width:1px;margin-top:40px; border-collapse: collapse;border-spacing: 0;width: 100%;border: 1px solid #ddd;}
                        tr{border-bottom: 1px solid #ddd;}th{font-weight:600}
                        th,td {text-align: left;padding:16px;}
                        table ul{list-style-type: circle;}.badge{font-weight:600;color:#f44336;}</style></head>
                        <body><header><h1>Emile Telecom
                        </h1></header>
                        <section id="body">
                            <table>
                                ${data}
                                <tfoot>
                                    ${tfoot}
                                </tfoot>
                            </table>
                        </section>
                    </body>
                    </html>`;
                    
                    var options = { format: 'Letter' };
                    pdf.create(html, options).toFile(file, function(err, res) {
                        jQuery('#tableExport').waitMe("hide");
                        if (err) {
                            notifications.error('Impossible de genere pdf (CHTMTOPDF)');
                            return;
                        }
                        modal.close();
                        notifications.success('PDF généré');
                             // { filename: '/app/businesscard.pdf' }
                        }); 
    
    
                    })
                    break;
                }
            })
        }
    
        $scope.finalStock = (id) => {
            for (let i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].id === id) {
                    return $scope.items[i].qty;
                }
            }
            return 'fin';
        }
    });
    //
    








});
