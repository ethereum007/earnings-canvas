INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('WIPRO', 'Wipro Ltd', 'Information Technology', 'WIPRO', 'Large Cap')
ON CONFLICT DO NOTHING;