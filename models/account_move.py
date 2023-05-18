# -*- coding: utf-8 -*-
from odoo import models, fields, api


class AccountMove(models.Model):
    _inherit = 'account.move'
    
    @api.model
    def get_account_move_lines(self):
        self.env.cr.execute("""
                            SELECT DISTINCT t9.name as company_name,t1.id,t1.date, t1.name as move_name,t6.vat, t6.name as partner_name,
                            t5.name as categ_name, t2.name as product_name,
                            CASE
                                WHEN t1.move_type = 'out_refund' THEN t2.quantity*-1
                                ELSE t2.quantity
                            END AS quantity,
                            CASE
                                WHEN t1.move_type = 'out_refund'AND t7.name = 'PEN' THEN t2.price_total*-1
                                WHEN t1.move_type = 'out_refund'AND t7.name = 'USD' THEN ROUND((t2.price_total*(1/t8.rate))*-1,2)
                                WHEN t1.move_type = 'out_invoice'AND t7.name = 'USD' THEN ROUND((t2.price_total*(1/t8.rate)),2)
                                ELSE t2.price_total
                            END as price_total
                        FROM public.account_move t1
                        LEFT JOIN public.account_move_line t2 ON t1.id = t2.move_id
                        LEFT JOIN public.product_product t3 ON t3.id = t2.product_id
                        LEFT JOIN public.product_template t4 ON t4.id =t3.product_tmpl_id 
                        LEFT JOIN public.product_category t5 ON t5.id = t4.categ_id
                        LEFT JOIN public.res_partner t6 ON t6.id = t1.partner_id
                        LEFT JOIN public.res_currency t7 ON t7.id = t1.currency_id 
                        LEFT JOIN public.res_currency_rate t8 on t1.date = t8.name 
                        LEFT JOIN public.res_company t9 on t9.id = t1.company_id

                        WHERE t1.state = 'posted'
                            and t1.move_type in ('out_invoice', 'out_refund')
                            and t1.company_id in (1,2)
                            and t2.display_type = 'product'
                        ORDER BY t1.date""")
        res = self.env.cr.dictfetchall()
        return res