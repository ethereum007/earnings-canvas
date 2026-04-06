INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ICICIAMC', 'ICICI Prudential AMC Ltd', 'Financial Services', 'ICICIAMC', 'Large Cap')
ON CONFLICT DO NOTHING;