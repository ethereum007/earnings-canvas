INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ARE&M', 'Amara Raja Energy & Mobility Ltd', 'Batteries', 'ARE&M', 'Mid Cap')
ON CONFLICT DO NOTHING;