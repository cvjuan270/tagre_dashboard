# -*- coding: utf-8 -*-
from odoo import models, fields, api


class AccountMove(models.Model):
    _inherit = 'account.move'
    
    @api.model
    def get_account_move_lines(self):
        self.env.cr.execute("""
                            SELECT  t9.name as company_name,t1.id,t1.date, t1.name as move_name,t1.move_type,t6.vat, t6.name as partner_name, t5.name as categ_name, t2.name as product_name,
                                CASE
                                    WHEN t1.move_type = 'out_refund' THEN (t2.quantity)*-1
                                    ELSE t2.quantity
                                END AS quantity,
                                CASE
                                    WHEN t1.move_type = 'out_invoice' AND t1.currency_id = 154 THEN (t2.price_total)
                                    WHEN t1.move_type = 'out_invoice' AND t1.currency_id = 2 THEN (t2.price_total)*(1/t8.rate)
                                    WHEN t1.move_type = 'out_refund' AND t1.currency_id = 154 THEN (t2.price_total)*-1
                                    WHEN t1.move_type = 'out_refund' AND t1.currency_id = 2 THEN ((t2.price_total)*(1/t8.rate))*-1
                                END AS price_total
                            FROM public.account_move t1
                            LEFT JOIN public.account_move_line t2 ON t1.id = t2.move_id
                            LEFT JOIN public.product_product t3 ON t3.id = t2.product_id
                            LEFT JOIN public.product_template t4 ON t4.id =t3.product_tmpl_id
                            LEFT JOIN public.product_category t5 ON t5.id = t4.categ_id
                            LEFT JOIN public.res_partner t6 ON t6.id = t1.partner_id
                            LEFT JOIN public.res_currency t7 ON t7.id = t1.currency_id
                            LEFT JOIN public.res_currency_rate t8 on t1.company_id = t8.company_id AND t1.date = t8.name
                            LEFT JOIN public.res_company t9 on t9.id = t1.company_id

                            WHERE t1.state = 'posted'
                                and t1.move_type in ('out_invoice', 'out_refund')
                                and t1.company_id in (1,2)
                                and t2.display_type = 'product'
                            ORDER BY DATE_TRUNC('month',t1.date)
                            """)
        res = self.env.cr.dictfetchall()
        
        amount_month = {}
        for item in res:
            month = str(item['date'].month)
            value = item['price_total']
            amount_month[month] = amount_month.get(month,0)+ value
        print(amount_month)
        
        return res