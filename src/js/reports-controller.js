app.controller('reportsCtr',($scope)=>{
    //init
    $scope.salesItems = [];


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
        $scope.sales.forEach((el)=>{
            $scope.salesItems = $scope.salesItems.concat(el.items);
            console.log(el.items)

        })
        var ctx = document.getElementById('salesChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            // The data for our dataset
            data: {
                labels:['Aujhui','Heir','30/10/18','29/10/18','28/10/18'],
                datasets: [{
                    label: "Ventes",
                    backgroundColor:'rgba(0, 150, 136,0.6)',
                    borderColor:'rgb(10, 150, 136)',
                    data:[40,35,23,41,25],
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



});