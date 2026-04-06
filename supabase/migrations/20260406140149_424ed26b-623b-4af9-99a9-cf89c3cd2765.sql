INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('EXIDEIND', 'Exide Industries Ltd', 'Batteries', 'EXIDEIND', 'Mid Cap')
ON CONFLICT DO NOTHING;