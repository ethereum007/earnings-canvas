INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('SHREECEM', 'Shree Cement Ltd', 'Cement', 'SHREECEM', 'Large Cap')
ON CONFLICT DO NOTHING;