INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('HINDALCO', 'Hindalco Industries Ltd', 'Metals & Mining', 'HINDALCO', 'Large Cap')
ON CONFLICT DO NOTHING;