INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('GILLETTE', 'Gillette India Ltd', 'FMCG', 'GILLETTE', 'Large Cap')
ON CONFLICT DO NOTHING;