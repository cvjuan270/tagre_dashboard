odoo.define('tagre_dashboard.income', function(require){
    'user strict'
    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core')
    var data = []
    var fechaActual = new Date();
    var mesActual = fechaActual.getMonth() + 1; // Sumamos 1 porque los meses en JavaScript se indexan desde 0


    var IncomeDashboard = AbstractAction.extend({
        template: 'tmpl_income_dashboard',

        start:function(){
            var self = this;
            self.monthly_goal_chart = undefined;
            self.category_chart = undefined;
            self._super()
            core.bus.on('DOM_updated', this, function(){
                self.get_account_move_lines().then(function(values){
                    //add attribute year_month to items in array
                    data = values.map(item=>{return{...item, year_month: new Date(item.date).getFullYear()+'-'+ (new Date(item.date).toLocaleString('default',{month:'long'}))}});
                    self.render_row_incomin()
                    self.render_monthly_goal_chart()
                    self.render_category_chart()
                })
            });
        },

        // amount for years
        get_amount_total_years:function(){
            var amounts = data.reduce((a,b)=>{
                var year = (new Date(b.date)).getFullYear()
                if (!a[year]) {
                    a[year] = 0;
                }
                a[year] += Math.ceil(parseFloat(b.price_total))
                return a
            },{});
            console.log(amounts)
            return amounts;
        },

        get_amount_total_months:function(){
            var amounts = data.reduce((a,b)=>{
                var year_month = b.year_month
                if (!a[year_month]) {
                    a[year_month] = 0;
                }
                a[year_month] += Math.ceil(parseFloat(b.price_total))
                return a
            },{});
            console.log(amounts)
            return amounts;
        },
        // get info to backend
        get_account_move_lines:function(){
            return this._rpc({
                model:'account.move',
                method: 'get_account_move_lines',
                args:[],
                kwargs:{}
            });
        },

        render_row_incomin:function(){
            var i_i_m = document.getElementById('invoicing_income_month')
            var i_i_y = document.getElementById('invoice_income_year')
            i_i_m.innerHTML = 'S/ ' + this.get_amount_total_months()[new Date().getFullYear()+'-'+ new Date().toLocaleString('default',{month:'long'})].toLocaleString('es-PE', { useGrouping: true })
            i_i_y.innerHTML = 'S/ ' + this.get_amount_total_years()[new Date().getFullYear()].toLocaleString('es-PE', { useGrouping: true })
        },

        render_monthly_goal_chart:function(){
            var ctx = document.getElementById('monthly_goal_chart')
            var values = this.get_amount_total_months()
            self.monthly_goal_chart = new Chart(ctx, {
                type:'bar',
                data:{
                    labels: Object.keys(values).slice(-6),
                    datasets: [
                        {
                            label: 'Monto Facturado',
                            data: Object.values(values).slice(-6),
                            backgroundColor: backgroundColor,
                            borderColor: borderColor,
                            borderWidth: 1
                        },
                        {
                            label: "Objetivo de ventas",
                            data: monthly_goals,
                            type: 'line',
                            fill: false,
                            borderColor: "rgba(255, 99, 132, 1)",
                        }
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        datalabels: {
                            anchor: "end",
                            align: "top",
                            color: "black",
                            font: {
                                weight: "bold"
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },

        render_category_chart:function(){
            var i_c_c = document.getElementById('income_categ_chart')
            var values = data.reduce((a,b)=>{
                var categ = b.categ_name;
                if (!a[categ]) {
                    a[categ] = 0;
                }
                a[categ] += b.price_total
                return a;
            },{});

            self.category_chart = new Chart(i_c_c,{
                type:'pie',
                data:{
                    labels: Object.keys(values),
                    datasets: [
                        {
                            label: 'Monto Facturado',
                            data: Object.values(values),
                            backgroundColor: [
                                'rgb(255, 99, 132)',
                                'rgb(75, 192, 192)',
                                'rgb(255, 205, 86)',
                                'rgb(201, 203, 207)',
                                'rgb(54, 162, 235)'
                              ]
                        },]
                },
                options: {
                    //responsive: true,
                }
            })

        },

    });

    core.action_registry.add('tagre_dashboard_income', IncomeDashboard)
});