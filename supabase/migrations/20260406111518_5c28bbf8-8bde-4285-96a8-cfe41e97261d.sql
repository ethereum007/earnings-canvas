INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('UTIAMC', 'UTI Asset Management Co Ltd', 'Financial Services', 'UTIAMC', 'Mid Cap')
ON CONFLICT DO NOTHING;