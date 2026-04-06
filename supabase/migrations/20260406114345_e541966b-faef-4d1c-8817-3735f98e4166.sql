INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('INFY', 'Infosys Ltd', 'Information Technology', 'INFY/consolidated', 'Large Cap')
ON CONFLICT DO NOTHING;