INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('PERSISTENT', 'Persistent Systems Ltd', 'Information Technology', 'PERSISTENT/consolidated', 'Large Cap')
ON CONFLICT DO NOTHING;