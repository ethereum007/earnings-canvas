INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('BASF', 'BASF India Ltd', 'Chemicals', 'BASF', 'Mid Cap')
ON CONFLICT DO NOTHING;