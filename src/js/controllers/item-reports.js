Stockler.controller('stocks-reportsCtr',($scope,$routeParams)=>{
    const {
        dialog
    } = require('electron').remote;

    $scope.type = $routeParams.type;
    $scope.redirection = $routeParams.redir;
    if($scope.redirection !== 'none'){
        $scope.redirectionBtn = true;
        //fefixing
        $scope.redirection = $scope.redirection.replace('-','/');
        //redirect link
        $scope.redir = {url:`#!${$scope.redirection}`}
        //console.log($scope.redir);
    }
    //vars
    $scope.displayMode = $routeParams.type;
    $scope.previewedItem = {};
    $scope.itemView=false;
    //functions
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
    /*$('.dial')
    .val(27)
    .trigger('change');*/
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
    }).then(()=>{
            //get uniqie date sal
            /*for(let i =0;i<$scope.sales.length;i++){
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
        });*/
        jQuery('button.excel').on('click',()=>{
            console.log('okay');
            var url='data:application/vnd.ms-excel,' + encodeURIComponent($('#all_table').html()) 
            location.href=url
            return false;
        })
        $scope.$apply();
    }).catch(err=>{
        notifications.error('Erreur de base de donnees');
        console.error(err);
    });
    //dash.js $
    
    //function
    $scope.previewItem = (array,index)=>{
        $scope.itemView = true;
        $scope.editable = false;
        switch(array){
            case 'items':
            $scope.previewedItem = $scope.items[index];
            break;
            case 'inactive':
            $scope.previewedItem = $scope.filterItems.inactive[index];
            break;
            case 'active':
            $scope.previewedItem = $scope.filterItems.active[index];
            break;
            case 'low-stock':
            $scope.previewedItem = $scope.filterItems.lowStock[index];
            break;
            case 'broken-stock':
            $scope.previewedItem = $scope.filterItems.broken[index];
            break;
        }
        $scope.previewedItem.brand = `${$scope.previewedItem.brand}`;
    }
    //2modificatons on items
    //2.1 Updating
    $scope.updateItem = ()=>{
        $scope.previewedItem.brand = Number($scope.previewedItem.brand);
                if(typeof $scope.previewedItem.model !== 'string' || $scope.previewedItem.model == ''){
                    notifications.warning('Un nom de serie valide requise!');
                    return;
                }
                $scope.previewedItem.qty = Number($scope.previewedItem.qty) + Number(jQuery('#updateItemQty').val());
                if($scope.previewedItem.qty < 0){
                    notifications.warning('Vous ne pouvez pas supprimer une quantité supérieure a la quantité du stock');
                    return;
                }
                if(typeof $scope.previewedItem.qty == 'number'){
                    $scope.previewedItem.date = new Date().getTime();
                    if($scope.previewedItem.qty > 0 && 
                        $scope.previewedItem.qty > $scope.getLowStockVal($scope.previewedItem.price)){
                            $scope.previewedItem.status = 'active';
                    }else if($scope.previewedItem.qty > 0 && 
                        $scope.previewedItem.qty <= $scope.getLowStockVal($scope.previewedItem.price)){
                        $scope.previewedItem.status = 'low-stock';
                    }else if($scope.previewedItem.qty == 0){
                        $scope.previewedItem.status = 'inactive';
                    }
                }
                //transcation
                $scope.db.transaction('rw',$scope.db.items,$scope.db.itemRecords,()=>{
                //updating
                $scope.db.items.put($scope.previewedItem)
                //recording
                $scope.addItemsRecords($scope.previewedItem);
                //reading
                $scope.db.items.toArray()
                    .then(data=>{
                        $scope.items = data;
                    })
            }).then(()=>{
                notifications.success("Modifier!");
                $scope.previewedItem = {};
                $scope.itemView = false;
                $scope.$apply();
            }).catch(err=>{
                try{
                    if(err.failures[0] === "negative_qty"){
                        notifications.error('Vous ne pouvez pas supprimer une quantité supérieure a la quantité du stock');
                    }
                }catch(e){
                    notifications.error('Erreur de base donnees');
                }
                console.error(err);
            })
    };
    //2.2 deleting
    $scope.deleteItem = (i)=>{
        if(confirm('Etes vous sur des suprimmer cette element?')){
            //transcation
            $scope.db.transaction('rw',$scope.db.items,()=>{
                $scope.db.items.delete(i)
                $scope.db.items.toArray()
                    .then(data=>{
                        $scope.items = data;
                    })
            }).then(()=>{
                notifications.success("Suprimmer!");
                $scope.previewedItem = {};
                $scope.itemView = false;
                $scope.$apply();
            }).catch(err=>{
                notifications.error('Erreur de base donnees');
                console.error(err);
            })
        }
    };
    //3.export table
    $scope.exportTable = (e,type,table,label) => {
            //export
            var d = new Date();
            //var table = jQuery(`#${$scope.selectedTableExport}`);
            //var file = (table == 'itemsLogs')?'Variation_de_stock':'Ventes_effectuer';
            var file = `${label}_${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}`;
            switch(type){
                case 'excel':
                    $scope.excel.createExcel({
                        id:table,
                        title:"Excel",
                        name:'Sheet1',
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
                            jQuery(e.target).waitMe({
                                effect : 'bounce',
                                bg : 'rgba(255,255,255,0.9)',
                                color : '#ff6f00',
                                maxSize : '',
                                waitTime : -1,
                                textPos : 'vertical',
                                fontSize : '',
                                source : ''
                                });
                        var fs = require('fs');
                        var pdf = require('html-pdf');
                        var data = jQuery(`#${table}`).html();
                    const html = `<html lang="en"><head><meta charset="UTF-8"><style>
                    * {margin: 0;padding: 0;box-sizing: border-box;}
                    body{text-align: center;font-family: sans-serif;}
                    header{background-color:#ff6f00;color: #fff;padding: 20px;}
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
                            </tfoot>
                        </table>
                    </section>
                </body>
                </html>`;
                
                var options = { format: 'Letter' };
                pdf.create(html, options).toFile(file, function(err, res) {
                    jQuery(e.target).waitMe("hide");
                    if (err) {
                        notifications.error('Impossible de genere pdf (CHTMTOPDF)');
                        console.log(err)
                        return;
                    }
                    //modal.close();
                    notifications.success('PDF généré');
                         // { filename: '/app/businesscard.pdf' }
                    }); 


                })
                break;
            }
    }



})