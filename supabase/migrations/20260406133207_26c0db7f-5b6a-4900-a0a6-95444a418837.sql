INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ADANIGREEN', 'Adani Green Energy Ltd', 'Renewable Energy', 'ADANIGREEN', 'Large Cap')
ON CONFLICT DO NOTHING;