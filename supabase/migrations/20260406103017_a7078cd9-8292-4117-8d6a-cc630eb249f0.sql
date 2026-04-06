INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ICICIGI', 'ICICI Lombard General Insurance Co Ltd', 'Financial Services', 'ICICIGI', 'Large Cap')
ON CONFLICT DO NOTHING;