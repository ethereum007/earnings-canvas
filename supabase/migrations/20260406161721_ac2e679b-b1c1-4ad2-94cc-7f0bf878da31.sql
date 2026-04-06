INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('DRREDDY', 'Dr Reddys Laboratories Ltd', 'Pharmaceuticals', 'DRREDDY', 'Large Cap')
ON CONFLICT DO NOTHING;