INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('TECHM', 'Tech Mahindra Ltd', 'Information Technology', 'TECHM/consolidated', 'Large Cap')
ON CONFLICT DO NOTHING;