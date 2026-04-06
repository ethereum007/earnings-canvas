INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('NESTLEIND', 'Nestle India Ltd', 'FMCG', 'NESTLEIND', 'Large Cap')
ON CONFLICT DO NOTHING;