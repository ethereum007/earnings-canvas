INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('NAM-INDIA', 'Nippon Life India Asset Management Ltd', 'Asset Management', 'NAM-INDIA', 'Mid Cap')
ON CONFLICT DO NOTHING;