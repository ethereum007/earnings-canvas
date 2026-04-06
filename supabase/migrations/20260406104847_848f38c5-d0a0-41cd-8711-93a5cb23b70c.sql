INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('HDFCAMC', 'HDFC Asset Management Co Ltd', 'Financial Services', 'HDFCAMC', 'Large Cap')
ON CONFLICT DO NOTHING;