odoo.define('tagre_dashboard.income', function (require) {
    'user strict'
    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core')
    var data = []


    var IncomeDashboard = AbstractAction.extend({
        template: 'tmpl_income_dashboard',

        start: function () {
            var self = this;
            self.monthly_goal_chart = undefined;
            self.category_chart = undefined;
            self.category_chart_quantity = undefined;
            self.products_income_more_chart = undefined;

            self._super()
            core.bus.on('DOM_updated', this, function () {
                self.get_account_move_lines().then(function (values) {
                    //add attribute year_month to items in array
                    data = values.map(item => { return { ...item, year_month: new Date(item.date).getFullYear() + '-' + (new Date(item.date).toLocaleString('default', { month: 'long', timeZone: 'UTC' })) } });

                    self.render_row_incomin();
                    self.render_monthly_goal_chart();
                    self.render_category_chart();
                    self.render_categ_chart_quantity();
                    self.render_products_income_more_chart();

                    console.log(data)
                })
            });
        },

        // amount for years
        get_amount_total_years: function () {
            var amounts = data.reduce((a, b) => {
                var year = (new Date(b.date)).getFullYear()
                if (!a[year]) {
                    a[year] = 0;
                }
                a[year] += Math.ceil(parseFloat(b.price_total))
                return a
            }, {});
            return amounts;
        },

        get_amount_total_months: function () {
            var amounts = data.reduce((a, b) => {
                var year_month = b.year_month
                if (!a[year_month]) {
                    a[year_month] = 0;
                }
                a[year_month] += b.price_total
                return a
            }, {});
            return amounts;
        },
        // get info to backend
        get_account_move_lines: function () {
            return this._rpc({
                model: 'account.move',
                method: 'get_account_move_lines',
                args: [],
                kwargs: {}
            });
        },

        render_row_incomin: function () {
            var i_i_m = document.getElementById('invoicing_income_month')
            var i_i_y = document.getElementById('invoice_income_year')
            i_i_m.innerHTML = 'S/ ' + this.get_amount_total_months()[new Date().getFullYear() + '-' + new Date().toLocaleString('default', { month: 'long' })].toLocaleString('es-PE', { useGrouping: true })
            i_i_y.innerHTML = 'S/ ' + this.get_amount_total_years()[new Date().getFullYear()].toLocaleString('es-PE', { useGrouping: true })
        },

        render_monthly_goal_chart: function () {
            var ctx = document.getElementById('monthly_goal_chart')
            var values = this.get_amount_total_months()
            self.monthly_goal_chart = new Chart(ctx, {
                type: 'bar',
                data: {
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
                            backgroundColor: "rgba(255, 99, 132, 1)",
                            borderColor: "rgba(255, 99, 132, 1)",
                        }
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'INGRESOS BRUTO VS. PROYECTADO'
                        },
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

        render_category_chart: function () {
            var i_c_c = document.getElementById('income_categ_chart')
            var values = data.reduce((a, b) => {
                var categ = b.categ_name;
                if (!a[categ]) {
                    a[categ] = 0;
                }
                a[categ] += b.price_total
                return a;
            }, {});

            self.category_chart = new Chart(i_c_c, {
                type: 'doughnut',
                data: {
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
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'INGRESOS POR CATEGORÍA DE PRODUCTOS S/'
                        }
                    }
                }
            })

        },

        render_categ_chart_quantity: function () {
            var i_c_c_q = document.getElementById('income_categ_chart_quantity')
            var values = data.reduce((a, b) => {
                var categ = b.categ_name;
                if (!a[categ]) {
                    a[categ] = 0;
                }
                a[categ] += b.quantity
                return a
            }, {});

            self.category_chart_quantity = new Chart(i_c_c_q, {
                type: 'bar',
                data: {
                    labels: Object.keys(values),
                    datasets: [
                        {
                            data: Object.values(values),
                            backgroundColor: backgroundColor1,
                        },]
                },
                options: {
                    indexAxis: 'y',
                    // Elements options apply to all of the options unless overridden in a dataset
                    // In this case, we are setting the border of each horizontal bar to be 2px wide
                    elements: {
                        bar: {
                            borderWidth: 0,
                        }
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false,
                            //position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'CANTIDAD POR CATEGORÍA DE PRODUCTOS'
                        }
                    }
                },
            })
        },

        render_products_income_more_chart: function(){
            var p_i_c = document.getElementById('products_income_more')
            var values = data.reduce((a, b) => {
                var p_name = b.product_name;
                if (!a[p_name]) {
                    a[p_name] = 0;
                }
                a[p_name] += b.price_total
                return a
            }, {});
            
            var sort_values = Object.entries(values).sort(function(a,b){
                return b[1]-a[1];
            })
            var top_10 = sort_values.slice(0,10);

            self.products_income_more_chart = new Chart(p_i_c, {
                type: 'bar',
                data: {
                    labels: _.map(top_10,(a)=>{return a[0]}),
                    datasets: [
                        {
                            data: _.map(top_10,(a)=>{return a[1]}),
                            backgroundColor: backgroundColor1,
                        },]
                },
                options: {
                    indexAxis: 'y',
                    // Elements options apply to all of the options unless overridden in a dataset
                    // In this case, we are setting the border of each horizontal bar to be 2px wide
                    elements: {
                        bar: {
                            borderWidth: 0,
                        }
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false,
                            //position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'TOP 10 PRODUCTOS [S/]'
                        }
                    }
                },
            })

        },

    });

    core.action_registry.add('tagre_dashboard_income', IncomeDashboard)
});