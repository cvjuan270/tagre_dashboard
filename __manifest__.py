# -*- coding: utf-8 -*-
{
    'name': "tagre_dashboard",

    'summary': """
        Short (1 phrase/line) summary of the module's purpose, used as
        subtitle on modules listing or apps.openerp.com""",

    'description': """
        Long description of module's purpose
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','spreadsheet_dashboard', 'account'],

    # always loaded
    'data': [
        'views/tagre_dashboard_views.xml'
    ],
    'assets':{
        'web.assets_backend':[
            'tagre_dashboard/static/src/xml/dashboard.xml',
            'tagre_dashboard/static/src/js/tagre_dashboard.js',
            'tagre_dashboard/static/src/css/tagre_dashboard.css',
            'tagre_dashboard/static/src/js/monthly_goals.js',
            #'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.3.0/chart.min.js'
            'https://cdn.jsdelivr.net/npm/chart.js',
            'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels'
        ]
    }
}
