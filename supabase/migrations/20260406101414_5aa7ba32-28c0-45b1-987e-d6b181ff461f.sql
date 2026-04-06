INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('TCS', 'Tata Consultancy Services Ltd', 'Information Technology', 'TCS', 'Large Cap')
ON CONFLICT DO NOTHING;